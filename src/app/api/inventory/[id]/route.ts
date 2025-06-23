import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/services/inventoryService'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const resolvedParams = await params
    const inventory = await inventoryService.getInventoryById(resolvedParams.id, companyId)
    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Get inventory error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch inventory' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const resolvedParams = await params
    const body = await request.json()
    const { currentQuantity, maxCapacity, reorderThreshold } = body

    if (currentQuantity !== undefined && currentQuantity < 0) {
      return NextResponse.json(
        { error: 'Current quantity cannot be negative' }, 
        { status: 400 }
      )
    }

    const inventory = await inventoryService.updateInventory(resolvedParams.id, companyId, {
      currentQuantity: currentQuantity !== undefined ? parseInt(currentQuantity) : undefined,
      maxCapacity: maxCapacity !== undefined ? parseInt(maxCapacity) : undefined,
      reorderThreshold: reorderThreshold !== undefined ? parseInt(reorderThreshold) : undefined
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Update inventory error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update inventory' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const resolvedParams = await params
    await inventoryService.deleteInventory(resolvedParams.id, companyId)
    return NextResponse.json({ message: 'Inventory deleted successfully' })
  } catch (error) {
    console.error('Delete inventory error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete inventory' },
      { status: 500 }
    )
  }
} 