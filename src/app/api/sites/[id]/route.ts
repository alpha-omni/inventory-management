import { NextRequest, NextResponse } from 'next/server'
import { siteService } from '@/services/siteService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const site = await siteService.getSiteById(params.id, companyId)
    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    return NextResponse.json(site)
  } catch (error) {
    console.error('Get site error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site' },
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
    const { name, address } = body

    const site = await siteService.updateSite(params.id, companyId, {
      name,
      address
    })

    return NextResponse.json(site)
  } catch (error) {
    console.error('Update site error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update site' },
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

    await siteService.deleteSite(params.id, companyId)
    return NextResponse.json({ message: 'Site deleted successfully' })
  } catch (error) {
    console.error('Delete site error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 }
    )
  }
} 