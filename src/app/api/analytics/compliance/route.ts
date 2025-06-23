import { NextRequest, NextResponse } from 'next/server'
import { analyticsService } from '@/services/analyticsService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const compliance = await analyticsService.getComplianceMetrics(companyId)
    
    return NextResponse.json(compliance)
  } catch (error) {
    console.error('Error fetching compliance metrics:', error)
    return NextResponse.json({ error: 'Failed to fetch compliance metrics' }, { status: 500 })
  }
} 