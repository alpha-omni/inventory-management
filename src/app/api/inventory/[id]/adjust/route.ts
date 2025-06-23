import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/services/inventoryService'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { adjustment } = body

    if (adjustment === undefined || adjustment === 0) {
      return NextResponse.json(
        { error: 'Adjustment amount is required and cannot be zero' }, 
        { status: 400 }
      )
    }

    if (!Number.isInteger(adjustment)) {
      return NextResponse.json(
        { error: 'Adjustment must be a whole number' }, 
        { status: 400 }
      )
    }

    const resolvedParams = await params
    const inventory = await inventoryService.adjustQuantity(
      resolvedParams.id, 
      companyId, 
      parseInt(adjustment)
    )

    return NextResponse.json({
      ...inventory,
      message: `Inventory ${adjustment > 0 ? 'increased' : 'decreased'} by ${Math.abs(adjustment)}`
    })
  } catch (error) {
    console.error('Adjust inventory error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to adjust inventory' },
      { status: 500 }
    )
  }
} 