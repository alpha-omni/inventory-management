import { NextRequest, NextResponse } from 'next/server'
import { itemService } from '@/services/itemService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const medications = await itemService.getMedicationsWithSafetyFlags(companyId)
    
    // Categorize medications by safety type
    const safetyAlerts = {
      hazardous: medications.filter(med => med.isHazardous),
      highAlert: medications.filter(med => med.isHighAlert),
      lasa: medications.filter(med => med.isLASA),
      total: medications.length
    }

    return NextResponse.json(safetyAlerts)
  } catch (error) {
    console.error('Get medication safety alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch medication safety alerts' },
      { status: 500 }
    )
  }
} 