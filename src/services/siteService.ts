import { prisma } from '@/lib/prisma'

export interface CreateSiteData {
  name: string
  address?: string
  companyId: string
}

export interface UpdateSiteData {
  name?: string
  address?: string
}

export class SiteService {
  async createSite(data: CreateSiteData) {
    return prisma.site.create({
      data: {
        name: data.name,
        address: data.address,
        companyId: data.companyId,
      },
      include: {
        stockAreas: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
  }

  async getSitesByCompany(companyId: string) {
    return prisma.site.findMany({
      where: { companyId },
      include: {
        stockAreas: {
          include: {
            _count: {
              select: { inventory: true }
            }
          }
        },
        _count: {
          select: { stockAreas: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  async getSiteById(id: string, companyId: string) {
    return prisma.site.findFirst({
      where: { 
        id,
        companyId // Ensure multi-tenant isolation
      },
      include: {
        stockAreas: {
          include: {
            inventory: {
              include: {
                item: true
              }
            }
          }
        },
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
  }

  async updateSite(id: string, companyId: string, data: UpdateSiteData) {
    // First verify the site belongs to the company
    const site = await this.getSiteById(id, companyId)
    if (!site) {
      throw new Error('Site not found')
    }

    return prisma.site.update({
      where: { id },
      data,
      include: {
        stockAreas: true,
        company: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })
  }

  async deleteSite(id: string, companyId: string) {
    // First verify the site belongs to the company
    const site = await this.getSiteById(id, companyId)
    if (!site) {
      throw new Error('Site not found')
    }

    // Check if site has stock areas
    const stockAreasCount = await prisma.stockArea.count({
      where: { siteId: id }
    })

    if (stockAreasCount > 0) {
      throw new Error('Cannot delete site with existing stock areas')
    }

    return prisma.site.delete({
      where: { id }
    })
  }
}

export const siteService = new SiteService() 