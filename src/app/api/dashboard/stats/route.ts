import { NextRequest, NextResponse } from 'next/server'
import { siteService } from '@/services/siteService'
import { stockAreaService } from '@/services/stockAreaService'
import { itemService } from '@/services/itemService'
import { inventoryService } from '@/services/inventoryService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    // Fetch data from all services in parallel
    const [
      sites,
      stockAreas, 
      itemStats,
      inventoryStats,
      lowStockItems,
      safetyMedications
    ] = await Promise.all([
      siteService.getSitesByCompany(companyId),
      stockAreaService.getStockAreasByCompany(companyId),
      itemService.getItemStats(companyId),
      inventoryService.getInventoryStats(companyId),
      inventoryService.getLowStockItems(companyId),
      itemService.getMedicationsWithSafetyFlags(companyId)
    ])

    // Calculate additional metrics
    const dashboard = {
      sites: {
        total: sites.length,
        withStockAreas: sites.filter(site => site._count.stockAreas > 0).length
      },
      stockAreas: {
        total: stockAreas.length,
        withInventory: stockAreas.filter(area => area._count.inventory > 0).length
      },
      items: itemStats,
      inventory: {
        ...inventoryStats,
        lowStockItemsCount: lowStockItems.length
      },
      safety: {
        totalMedications: itemStats.medications,
        hazardousCount: safetyMedications.filter(med => med.isHazardous).length,
        highAlertCount: safetyMedications.filter(med => med.isHighAlert).length,
        lasaCount: safetyMedications.filter(med => med.isLASA).length
      },
      alerts: {
        lowStock: lowStockItems.slice(0, 5), // Top 5 low stock items
        outOfStock: inventoryStats.outOfStockCount,
        safetyMedications: safetyMedications.length
      }
    }

    return NextResponse.json(dashboard)
  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
} 