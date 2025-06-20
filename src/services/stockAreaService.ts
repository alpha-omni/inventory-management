import { prisma } from '@/lib/prisma'

export interface CreateStockAreaData {
  name: string
  siteId: string
}

export interface UpdateStockAreaData {
  name?: string
}

export class StockAreaService {
  async createStockArea(data: CreateStockAreaData, companyId: string) {
    // Verify the site belongs to the company
    const site = await prisma.site.findFirst({
      where: { 
        id: data.siteId,
        companyId
      }
    })

    if (!site) {
      throw new Error('Site not found or access denied')
    }

    return prisma.stockArea.create({
      data: {
        name: data.name,
        siteId: data.siteId,
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            companyId: true
          }
        },
        inventory: {
          include: {
            item: true
          }
        }
      }
    })
  }

  async getStockAreasBySite(siteId: string, companyId: string) {
    // Verify the site belongs to the company
    const site = await prisma.site.findFirst({
      where: { 
        id: siteId,
        companyId
      }
    })

    if (!site) {
      throw new Error('Site not found or access denied')
    }

    return prisma.stockArea.findMany({
      where: { siteId },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          }
        },
        inventory: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                type: true,
                isHazardous: true,
                isHighAlert: true,
                isLASA: true
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

  async getStockAreaById(id: string, companyId: string) {
    const stockArea = await prisma.stockArea.findFirst({
      where: { id },
      include: {
        site: {
          select: {
            id: true,
            name: true,
            companyId: true
          }
        },
        inventory: {
          include: {
            item: true
          }
        }
      }
    })

    // Check if stock area belongs to company
    if (!stockArea || stockArea.site.companyId !== companyId) {
      throw new Error('Stock area not found or access denied')
    }

    return stockArea
  }

  async updateStockArea(id: string, companyId: string, data: UpdateStockAreaData) {
    // First verify the stock area belongs to the company
    await this.getStockAreaById(id, companyId)

    return prisma.stockArea.update({
      where: { id },
      data,
      include: {
        site: {
          select: {
            id: true,
            name: true,
          }
        },
        inventory: {
          include: {
            item: true
          }
        }
      }
    })
  }

  async deleteStockArea(id: string, companyId: string) {
    // First verify the stock area belongs to the company
    await this.getStockAreaById(id, companyId)

    // Check if stock area has inventory
    const inventoryCount = await prisma.inventory.count({
      where: { stockAreaId: id }
    })

    if (inventoryCount > 0) {
      throw new Error('Cannot delete stock area with existing inventory')
    }

    return prisma.stockArea.delete({
      where: { id }
    })
  }

  async getStockAreasByCompany(companyId: string) {
    return prisma.stockArea.findMany({
      where: {
        site: {
          companyId
        }
      },
      include: {
        site: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: { inventory: true }
        }
      },
      orderBy: [
        { site: { name: 'asc' } },
        { name: 'asc' }
      ]
    })
  }
}

export const stockAreaService = new StockAreaService() 