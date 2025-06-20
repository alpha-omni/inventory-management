import { NextRequest, NextResponse } from 'next/server'
import { itemService } from '@/services/itemService'

export async function GET(request: NextRequest) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const filters = {
      type: searchParams.get('type') as 'MEDICATION' | 'SUPPLY' | undefined,
      isHazardous: searchParams.get('isHazardous') === 'true' ? true : undefined,
      isHighAlert: searchParams.get('isHighAlert') === 'true' ? true : undefined,
      isLASA: searchParams.get('isLASA') === 'true' ? true : undefined,
      search: searchParams.get('search') || undefined
    }

    const items = await itemService.getItemsByCompany(companyId, filters)
    return NextResponse.json(items)
  } catch (error) {
    console.error('Get items error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch items' },
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
    const { 
      name, 
      description, 
      type, 
      drugId, 
      isHazardous, 
      isHighAlert, 
      isLASA 
    } = body

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Item name and type are required' }, 
        { status: 400 }
      )
    }

    if (!['MEDICATION', 'SUPPLY'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be MEDICATION or SUPPLY' }, 
        { status: 400 }
      )
    }

    const item = await itemService.createItem({
      name,
      description,
      type,
      drugId,
      isHazardous: isHazardous || false,
      isHighAlert: isHighAlert || false,
      isLASA: isLASA || false,
      companyId
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Create item error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    )
  }
} 