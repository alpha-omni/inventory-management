import { NextRequest, NextResponse } from 'next/server'
import { siteService } from '@/services/siteService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const sites = await siteService.getSitesByCompany(companyId)
    return NextResponse.json(sites)
  } catch (error) {
    console.error('Get sites error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
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
    const { name, address } = body

    if (!name) {
      return NextResponse.json({ error: 'Site name is required' }, { status: 400 })
    }

    const site = await siteService.createSite({
      name,
      address,
      companyId
    })

    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error('Create site error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 }
    )
  }
} 