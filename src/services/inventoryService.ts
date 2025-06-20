import { prisma } from '@/lib/prisma'

export interface CreateInventoryData {
  itemId: string
  stockAreaId: string
  currentQuantity: number
  maxCapacity?: number
  reorderThreshold?: number
}

export interface UpdateInventoryData {
  currentQuantity?: number
  maxCapacity?: number
  reorderThreshold?: number
}

export interface InventoryFilters {
  siteId?: string
  stockAreaId?: string
  itemType?: 'MEDICATION' | 'SUPPLY'
  lowStock?: boolean
  search?: string
}

export class InventoryService {
  async createInventory(data: CreateInventoryData, companyId: string) {
    // Verify item belongs to company
    const item = await prisma.item.findFirst({
      where: { id: data.itemId, companyId }
    })
    if (!item) {
      throw new Error('Item not found or access denied')
    }

    // Verify stock area belongs to company
    const stockArea = await prisma.stockArea.findFirst({
      where: { 
        id: data.stockAreaId,
        site: { companyId }
      }
    })
    if (!stockArea) {
      throw new Error('Stock area not found or access denied')
    }

    // Check if inventory already exists for this item/stock area combination
    const existingInventory = await prisma.inventory.findUnique({
      where: {
        itemId_stockAreaId: {
          itemId: data.itemId,
          stockAreaId: data.stockAreaId
        }
      }
    })
    if (existingInventory) {
      throw new Error('Inventory already exists for this item in this stock area')
    }

    return prisma.inventory.create({
      data: {
        itemId: data.itemId,
        stockAreaId: data.stockAreaId,
        currentQuantity: data.currentQuantity,
        maxCapacity: data.maxCapacity,
        reorderThreshold: data.reorderThreshold,
      },
      include: {
        item: true,
        stockArea: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })
  }

  async getInventoryByCompany(companyId: string, filters?: InventoryFilters) {
    const where: Record<string, unknown> = {
      stockArea: {
        site: { companyId }
      }
    }

    if (filters) {
      if (filters.siteId) {
        where.stockArea = {
          ...where.stockArea as object,
          siteId: filters.siteId
        }
      }
      if (filters.stockAreaId) {
        where.stockAreaId = filters.stockAreaId
      }
      if (filters.itemType) {
        where.item = { type: filters.itemType }
      }
      if (filters.search) {
        where.item = {
          ...where.item as object,
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } }
          ]
        }
      }
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        item: true,
        stockArea: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Filter for low stock if requested
    if (filters?.lowStock) {
      return inventory.filter(inv => 
        inv.reorderThreshold && inv.currentQuantity <= inv.reorderThreshold
      )
    }

    return inventory
  }

  async getInventoryById(id: string, companyId: string) {
    const inventory = await prisma.inventory.findFirst({
      where: {
        id,
        stockArea: {
          site: { companyId }
        }
      },
      include: {
        item: true,
        stockArea: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })

    if (!inventory) {
      throw new Error('Inventory record not found')
    }

    return inventory
  }

  async updateInventory(id: string, companyId: string, data: UpdateInventoryData) {
    // First verify the inventory belongs to the company
    await this.getInventoryById(id, companyId)

    return prisma.inventory.update({
      where: { id },
      data,
      include: {
        item: true,
        stockArea: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })
  }

  async deleteInventory(id: string, companyId: string) {
    // First verify the inventory belongs to the company
    await this.getInventoryById(id, companyId)

    return prisma.inventory.delete({
      where: { id }
    })
  }

  async adjustQuantity(id: string, companyId: string, adjustment: number) {
    const inventory = await this.getInventoryById(id, companyId)
    const newQuantity = inventory.currentQuantity + adjustment

    if (newQuantity < 0) {
      throw new Error('Insufficient stock for this adjustment')
    }

    return prisma.inventory.update({
      where: { id },
      data: {
        currentQuantity: newQuantity,
      },
      include: {
        item: true,
        stockArea: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      }
    })
  }

  async getLowStockItems(companyId: string) {
    // Get all inventory items and filter in application code
    const inventory = await prisma.inventory.findMany({
      where: {
        stockArea: {
          site: { companyId }
        },
        reorderThreshold: { not: null }
      },
      include: {
        item: true,
        stockArea: {
          include: {
            site: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        }
      },
      orderBy: { currentQuantity: 'asc' }
    })

    // Filter for low stock items
    return inventory.filter(inv => 
      inv.reorderThreshold && inv.currentQuantity <= inv.reorderThreshold
    )
  }

  async getInventoryStats(companyId: string) {
    const [totalItems, outOfStockCount] = await Promise.all([
      prisma.inventory.count({
        where: {
          stockArea: {
            site: { companyId }
          }
        }
      }),
      prisma.inventory.count({
        where: {
          stockArea: {
            site: { companyId }
          },
          currentQuantity: 0
        }
      })
    ])

    // Calculate low stock count using the method above
    const lowStockItems = await this.getLowStockItems(companyId)

    return {
      totalItems,
      lowStockCount: lowStockItems.length,
      outOfStockCount
    }
  }
}

export const inventoryService = new InventoryService() 