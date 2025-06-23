import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/services/analyticsService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const usage = await analyticsService.getUsageAnalytics(companyId)
    
    return NextResponse.json(usage)
  } catch (error) {
    console.error('Error fetching usage analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch usage analytics' }, { status: 500 })
  }
} 