import { prisma } from '@/lib/prisma'
import { subDays, format } from 'date-fns'

export interface InventoryTrend {
  date: string
  totalItems: number
  lowStockCount: number
  outOfStockCount: number
}

export interface UsageAnalytics {
  itemId: string
  itemName: string
  itemType: 'MEDICATION' | 'SUPPLY'
  totalAdjustments: number
  averageUsage: number
  currentStock: number
  predictedDaysRemaining: number
  isHighUsage: boolean
  safetyFlags: {
    isHazardous: boolean
    isHighAlert: boolean
    isLASA: boolean
  }
}

export interface ComplianceMetrics {
  totalMedications: number
  hazardousCount: number
  highAlertCount: number
  lasaCount: number
  complianceScore: number
  criticalAlerts: Array<{
    type: string
    message: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    itemId?: string
    itemName?: string
  }>
}

export interface SitePerformance {
  siteId: string
  siteName: string
  totalItems: number
  stockAreas: number
  inventoryCount: number
  lowStockItems: number
  outOfStockItems: number
  efficiencyScore: number
  lastUpdated: string
}

export interface InventoryMovement {
  date: string
  type: 'ADJUSTMENT' | 'RESTOCK' | 'USAGE'
  quantity: number
  itemName: string
  stockAreaName: string
  siteName: string
  reason?: string
}

export class AnalyticsService {
  async getInventoryTrends(companyId: string, days: number = 30): Promise<InventoryTrend[]> {
    // For demonstration, we'll simulate trend data since we don't have historical data
    const trends: InventoryTrend[] = []
    
    // Get current inventory snapshot
    const inventoryStats = await this.getCurrentInventorySnapshot(companyId)
    
    for (let i = days; i >= 0; i--) {
      const date = subDays(new Date(), i)
      
      trends.push({
        date: format(date, 'yyyy-MM-dd'),
        totalItems: inventoryStats.totalItems + Math.floor(Math.random() * 10 - 5), // Simulate variation
        lowStockCount: inventoryStats.lowStockCount + Math.floor(Math.random() * 3 - 1),
        outOfStockCount: inventoryStats.outOfStockCount + Math.floor(Math.random() * 2),
      })
    }
    
    return trends
  }

  async getUsageAnalytics(companyId: string): Promise<UsageAnalytics[]> {
    // Get all inventory items for the company through the relationship
    const inventory = await prisma.inventory.findMany({
      where: {
        stockArea: {
          site: {
            companyId
          }
        }
      },
      include: {
        item: true,
        stockArea: {
          include: {
            site: true
          }
        }
      }
    })

    const analytics: UsageAnalytics[] = inventory.map(inv => {
      // Simulate usage calculations (in reality, you'd track actual movements)
      const simulatedUsage = Math.floor(Math.random() * 50) + 10
      const daysRemaining = inv.currentQuantity > 0 && simulatedUsage > 0 
        ? Math.floor(inv.currentQuantity / (simulatedUsage / 30)) 
        : 0

      return {
        itemId: inv.item.id,
        itemName: inv.item.name,
        itemType: inv.item.type as 'MEDICATION' | 'SUPPLY',
        totalAdjustments: simulatedUsage,
        averageUsage: simulatedUsage / 30,
        currentStock: inv.currentQuantity,
        predictedDaysRemaining: daysRemaining,
        isHighUsage: simulatedUsage > 100,
        safetyFlags: {
          isHazardous: inv.item.isHazardous,
          isHighAlert: inv.item.isHighAlert,
          isLASA: inv.item.isLASA,
        }
      }
    })

    return analytics.sort((a, b) => b.totalAdjustments - a.totalAdjustments)
  }

  async getComplianceMetrics(companyId: string): Promise<ComplianceMetrics> {
    // Get all medications for the company
    const medications = await prisma.item.findMany({
      where: { 
        inventory: {
          some: {
            stockArea: {
              site: {
                companyId
              }
            }
          }
        },
        type: 'MEDICATION'
      }
    })

    const hazardousCount = medications.filter(m => m.isHazardous).length
    const highAlertCount = medications.filter(m => m.isHighAlert).length
    const lasaCount = medications.filter(m => m.isLASA).length

    // Get low stock safety medications
    const lowStockSafetyMeds = await prisma.inventory.findMany({
      where: {
        stockArea: {
          site: {
            companyId
          }
        },
        item: {
          type: 'MEDICATION',
          OR: [
            { isHazardous: true },
            { isHighAlert: true },
            { isLASA: true }
          ]
        },
        OR: [
          { currentQuantity: 0 },
          {
            AND: [
              { reorderThreshold: { not: null } },
              { currentQuantity: { lte: prisma.inventory.fields.reorderThreshold } }
            ]
          }
        ]
      },
      include: {
        item: true
      }
    })

    const criticalAlerts = lowStockSafetyMeds.map(inv => ({
      type: 'LOW_STOCK_SAFETY_MEDICATION',
      message: `${inv.item.isHighAlert ? 'High Alert' : inv.item.isHazardous ? 'Hazardous' : 'LASA'} medication "${inv.item.name}" is ${inv.currentQuantity === 0 ? 'out of stock' : 'low stock'}`,
      priority: (inv.currentQuantity === 0 ? 'HIGH' : 'MEDIUM') as 'HIGH' | 'MEDIUM' | 'LOW',
      itemId: inv.item.id,
      itemName: inv.item.name
    }))

    // Calculate compliance score (0-100)
    const totalSafetyMeds = medications.filter(m => m.isHazardous || m.isHighAlert || m.isLASA).length
    const stockCompliantCount = totalSafetyMeds - lowStockSafetyMeds.length
    const complianceScore = totalSafetyMeds > 0 ? Math.round((stockCompliantCount / totalSafetyMeds) * 100) : 100

    return {
      totalMedications: medications.length,
      hazardousCount,
      highAlertCount,
      lasaCount,
      complianceScore,
      criticalAlerts
    }
  }

  async getSitePerformance(companyId: string): Promise<SitePerformance[]> {
    const sites = await prisma.site.findMany({
      where: { companyId },
      include: {
        stockAreas: {
          include: {
            inventory: {
              include: {
                item: true
              }
            }
          }
        }
      }
    })

    return sites.map(site => {
      const allInventory = site.stockAreas.flatMap(sa => sa.inventory)
      const lowStockItems = allInventory.filter(inv => 
        inv.reorderThreshold && inv.currentQuantity <= inv.reorderThreshold
      ).length
      const outOfStockItems = allInventory.filter(inv => inv.currentQuantity === 0).length
      
      // Calculate efficiency score based on stock levels and capacity utilization
      const totalCapacity = allInventory.reduce((sum, inv) => sum + (inv.maxCapacity || 0), 0)
      const totalStock = allInventory.reduce((sum, inv) => sum + inv.currentQuantity, 0)
      const capacityUtilization = totalCapacity > 0 ? (totalStock / totalCapacity) * 100 : 0
      const stockHealthScore = allInventory.length > 0 ? ((allInventory.length - outOfStockItems) / allInventory.length) * 100 : 100
      const efficiencyScore = Math.round((capacityUtilization * 0.3 + stockHealthScore * 0.7))

      return {
        siteId: site.id,
        siteName: site.name,
        totalItems: allInventory.length,
        stockAreas: site.stockAreas.length,
        inventoryCount: allInventory.length,
        lowStockItems,
        outOfStockItems,
        efficiencyScore,
        lastUpdated: new Date().toISOString()
      }
    })
  }

  async getPredictiveAlerts(companyId: string): Promise<Array<{
    type: string
    message: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    daysUntilCritical: number
    itemName: string
    currentStock: number
    predictedOutOfStock: string
  }>> {
    const usageAnalytics = await this.getUsageAnalytics(companyId)
    
    return usageAnalytics
      .filter(item => item.predictedDaysRemaining <= 14 && item.predictedDaysRemaining > 0)
      .map(item => ({
        type: 'PREDICTED_STOCKOUT',
        message: `${item.itemName} predicted to run out in ${item.predictedDaysRemaining} days`,
        priority: (item.predictedDaysRemaining <= 3 ? 'HIGH' : item.predictedDaysRemaining <= 7 ? 'MEDIUM' : 'LOW') as 'HIGH' | 'MEDIUM' | 'LOW',
        daysUntilCritical: item.predictedDaysRemaining,
        itemName: item.itemName,
        currentStock: item.currentStock,
        predictedOutOfStock: format(new Date(Date.now() + item.predictedDaysRemaining * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
      }))
      .sort((a, b) => a.daysUntilCritical - b.daysUntilCritical)
  }

  private async getCurrentInventorySnapshot(companyId: string) {
    const totalItems = await prisma.inventory.count({
      where: {
        stockArea: {
          site: {
            companyId
          }
        }
      }
    })

    const lowStockCount = await prisma.inventory.count({
      where: {
        stockArea: {
          site: {
            companyId
          }
        },
        AND: [
          { reorderThreshold: { not: null } },
          { currentQuantity: { lte: prisma.inventory.fields.reorderThreshold } }
        ]
      }
    })

    const outOfStockCount = await prisma.inventory.count({
      where: {
        stockArea: {
          site: {
            companyId
          }
        },
        currentQuantity: 0
      }
    })

    return { totalItems, lowStockCount, outOfStockCount }
  }

  async getInventoryMovements(companyId: string, days: number = 7): Promise<InventoryMovement[]> {
    // In a real system, you'd have an inventory_movements table
    // For now, we'll simulate recent movements
    const movements: InventoryMovement[] = []
    
    const inventory = await prisma.inventory.findMany({
      where: {
        stockArea: {
          site: {
            companyId
          }
        }
      },
      include: {
        item: true,
        stockArea: {
          include: {
            site: true
          }
        }
      },
      take: 10 // Get recent items for simulation
    })

    // Simulate movements for the last few days
    for (let i = 0; i < Math.min(20, inventory.length * 2); i++) {
      const randomInventory = inventory[Math.floor(Math.random() * inventory.length)]
      const daysAgo = Math.floor(Math.random() * days)
      const types: Array<'ADJUSTMENT' | 'RESTOCK' | 'USAGE'> = ['ADJUSTMENT', 'RESTOCK', 'USAGE']
      const type = types[Math.floor(Math.random() * types.length)]
      
      movements.push({
        date: format(subDays(new Date(), daysAgo), 'yyyy-MM-dd HH:mm'),
        type,
        quantity: type === 'USAGE' ? -(Math.floor(Math.random() * 10) + 1) : Math.floor(Math.random() * 50) + 1,
        itemName: randomInventory.item.name,
        stockAreaName: randomInventory.stockArea.name,
        siteName: randomInventory.stockArea.site.name,
        reason: type === 'ADJUSTMENT' ? 'Manual adjustment' : type === 'RESTOCK' ? 'New shipment' : 'Patient dispensing'
      })
    }

    return movements.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }
}

export const analyticsService = new AnalyticsService() 