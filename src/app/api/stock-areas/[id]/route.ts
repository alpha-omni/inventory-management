import { NextRequest, NextResponse } from 'next/server'
import { stockAreaService } from '@/services/stockAreaService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const stockArea = await stockAreaService.getStockAreaById(params.id, companyId)
    return NextResponse.json(stockArea)
  } catch (error) {
    console.error('Get stock area error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch stock area' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const body = await request.json()
    const { name } = body

    const stockArea = await stockAreaService.updateStockArea(params.id, companyId, {
      name
    })

    return NextResponse.json(stockArea)
  } catch (error) {
    console.error('Update stock area error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update stock area' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    await stockAreaService.deleteStockArea(params.id, companyId)
    return NextResponse.json({ message: 'Stock area deleted successfully' })
  } catch (error) {
    console.error('Delete stock area error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete stock area' },
      { status: 500 }
    )
  }
} 