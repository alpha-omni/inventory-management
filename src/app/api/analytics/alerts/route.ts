import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/services/analyticsService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const alerts = await analyticsService.getPredictiveAlerts(companyId)
    
    return NextResponse.json(alerts)
  } catch (error) {
    console.error('Error fetching predictive alerts:', error)
    return NextResponse.json({ error: 'Failed to fetch predictive alerts' }, { status: 500 })
  }
} 