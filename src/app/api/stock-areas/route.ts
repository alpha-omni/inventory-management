import { NextRequest, NextResponse } from 'next/server'
import { stockAreaService } from '@/services/stockAreaService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (siteId) {
      // Get stock areas for specific site
      const stockAreas = await stockAreaService.getStockAreasBySite(siteId, companyId)
      return NextResponse.json(stockAreas)
    } else {
      // Get all stock areas for company
      const stockAreas = await stockAreaService.getStockAreasByCompany(companyId)
      return NextResponse.json(stockAreas)
    }
  } catch (error) {
    console.error('Get stock areas error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch stock areas' },
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
    const { name, siteId } = body

    if (!name || !siteId) {
      return NextResponse.json(
        { error: 'Stock area name and site ID are required' }, 
        { status: 400 }
      )
    }

    const stockArea = await stockAreaService.createStockArea({
      name,
      siteId
    }, companyId)

    return NextResponse.json(stockArea, { status: 201 })
  } catch (error) {
    console.error('Create stock area error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create stock area' },
      { status: 500 }
    )
  }
} 