import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/services/inventoryService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      siteId: searchParams.get('siteId') || undefined,
      stockAreaId: searchParams.get('stockAreaId') || undefined,
      itemType: searchParams.get('itemType') as 'MEDICATION' | 'SUPPLY' | undefined,
      lowStock: searchParams.get('lowStock') === 'true',
      search: searchParams.get('search') || undefined
    }

    const inventory = await inventoryService.getInventoryByCompany(companyId, filters)
    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Get inventory error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { 
      itemId, 
      stockAreaId, 
      currentQuantity, 
      maxCapacity, 
      reorderThreshold 
    } = body

    if (!itemId || !stockAreaId || currentQuantity === undefined) {
      return NextResponse.json(
        { error: 'Item ID, stock area ID, and current quantity are required' }, 
        { status: 400 }
      )
    }

    if (currentQuantity < 0) {
      return NextResponse.json(
        { error: 'Current quantity cannot be negative' }, 
        { status: 400 }
      )
    }

    const inventory = await inventoryService.createInventory({
      itemId,
      stockAreaId,
      currentQuantity: parseInt(currentQuantity),
      maxCapacity: maxCapacity ? parseInt(maxCapacity) : undefined,
      reorderThreshold: reorderThreshold ? parseInt(reorderThreshold) : undefined
    }, companyId)

    return NextResponse.json(inventory, { status: 201 })
  } catch (error) {
    console.error('Create inventory error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create inventory' },
      { status: 500 }
    )
  }
} 