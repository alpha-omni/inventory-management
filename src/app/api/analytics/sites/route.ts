import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/services/analyticsService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const sites = await analyticsService.getSitePerformance(companyId)
    
    return NextResponse.json(sites)
  } catch (error) {
    console.error('Error fetching site performance:', error)
    return NextResponse.json({ error: 'Failed to fetch site performance' }, { status: 500 })
  }
} 