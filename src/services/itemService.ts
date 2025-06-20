import { prisma } from '@/lib/prisma'

export interface CreateItemData {
  name: string
  description?: string
  type: 'MEDICATION' | 'SUPPLY'
  drugId?: string
  isHazardous?: boolean
  isHighAlert?: boolean
  isLASA?: boolean
  companyId: string
}

export interface UpdateItemData {
  name?: string
  description?: string
  type?: 'MEDICATION' | 'SUPPLY'
  drugId?: string
  isHazardous?: boolean
  isHighAlert?: boolean
  isLASA?: boolean
}

export interface ItemFilters {
  type?: 'MEDICATION' | 'SUPPLY'
  isHazardous?: boolean
  isHighAlert?: boolean
  isLASA?: boolean
  search?: string
}

export class ItemService {
  async createItem(data: CreateItemData) {
    // Validate medication-specific fields
    if (data.type === 'MEDICATION' && !data.drugId) {
      throw new Error('Drug ID is required for medications')
    }

    return prisma.item.create({
      data: {
        name: data.name,
        description: data.description,
        type: data.type,
        drugId: data.drugId,
        isHazardous: data.isHazardous || false,
        isHighAlert: data.isHighAlert || false,
        isLASA: data.isLASA || false,
        companyId: data.companyId,
      },
      include: {
        inventory: {
          include: {
            stockArea: {
              include: {
                site: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { inventory: true }
        }
      }
    })
  }

  async getItemsByCompany(companyId: string, filters?: ItemFilters) {
    const where: Record<string, unknown> = { companyId }

    if (filters) {
      if (filters.type) {
        where.type = filters.type
      }
      if (filters.isHazardous !== undefined) {
        where.isHazardous = filters.isHazardous
      }
      if (filters.isHighAlert !== undefined) {
        where.isHighAlert = filters.isHighAlert
      }
      if (filters.isLASA !== undefined) {
        where.isLASA = filters.isLASA
      }
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { drugId: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    }

    return prisma.item.findMany({
      where,
      include: {
        inventory: {
          include: {
            stockArea: {
              include: {
                site: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { inventory: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getItemById(id: string, companyId: string) {
    const item = await prisma.item.findFirst({
      where: { 
        id,
        companyId // Ensure multi-tenant isolation
      },
      include: {
        inventory: {
          include: {
            stockArea: {
              include: {
                site: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!item) {
      throw new Error('Item not found')
    }

    return item
  }

  async updateItem(id: string, companyId: string, data: UpdateItemData) {
    // First verify the item belongs to the company
    await this.getItemById(id, companyId)

    // Validate medication-specific fields
    if (data.type === 'MEDICATION' && data.drugId === '') {
      throw new Error('Drug ID is required for medications')
    }

    return prisma.item.update({
      where: { id },
      data,
      include: {
        inventory: {
          include: {
            stockArea: {
              include: {
                site: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        },
        _count: {
          select: { inventory: true }
        }
      }
    })
  }

  async deleteItem(id: string, companyId: string) {
    // First verify the item belongs to the company
    await this.getItemById(id, companyId)

    // Check if item has inventory records
    const inventoryCount = await prisma.inventory.count({
      where: { itemId: id }
    })

    if (inventoryCount > 0) {
      throw new Error('Cannot delete item with existing inventory records')
    }

    return prisma.item.delete({
      where: { id }
    })
  }

  async getMedicationsWithSafetyFlags(companyId: string) {
    return prisma.item.findMany({
      where: {
        companyId,
        type: 'MEDICATION',
        OR: [
          { isHazardous: true },
          { isHighAlert: true },
          { isLASA: true }
        ]
      },
      select: {
        id: true,
        name: true,
        drugId: true,
        isHazardous: true,
        isHighAlert: true,
        isLASA: true,
        _count: {
          select: { inventory: true }
        }
      },
      orderBy: { name: 'asc' }
    })
  }

  async getItemStats(companyId: string) {
    const [total, medications, supplies, hazardous, highAlert, lasa] = await Promise.all([
      prisma.item.count({ where: { companyId } }),
      prisma.item.count({ where: { companyId, type: 'MEDICATION' } }),
      prisma.item.count({ where: { companyId, type: 'SUPPLY' } }),
      prisma.item.count({ where: { companyId, isHazardous: true } }),
      prisma.item.count({ where: { companyId, isHighAlert: true } }),
      prisma.item.count({ where: { companyId, isLASA: true } })
    ])

    return {
      total,
      medications,
      supplies,
      hazardous,
      highAlert,
      lasa
    }
  }
}

export const itemService = new ItemService() 