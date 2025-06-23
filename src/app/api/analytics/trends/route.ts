import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/services/analyticsService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '30')

    const trends = await analyticsService.getInventoryTrends(companyId, days)
    
    return NextResponse.json(trends)
  } catch (error) {
    console.error('Error fetching inventory trends:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory trends' }, { status: 500 })
  }
} 