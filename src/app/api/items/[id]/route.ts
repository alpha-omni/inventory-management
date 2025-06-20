import { NextRequest, NextResponse } from 'next/server'
import { itemService } from '@/services/itemService'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const companyId = request.headers.get('x-company-id')
    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const item = await itemService.getItemById(params.id, companyId)
    return NextResponse.json(item)
  } catch (error) {
    console.error('Get item error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(
      { error: 'Failed to fetch item' },
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
    const { 
      name, 
      description, 
      type, 
      drugId, 
      isHazardous, 
      isHighAlert, 
      isLASA 
    } = body

    if (type && !['MEDICATION', 'SUPPLY'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be MEDICATION or SUPPLY' }, 
        { status: 400 }
      )
    }

    const item = await itemService.updateItem(params.id, companyId, {
      name,
      description,
      type,
      drugId,
      isHazardous,
      isHighAlert,
      isLASA
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Update item error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to update item' },
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

    await itemService.deleteItem(params.id, companyId)
    return NextResponse.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Delete item error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
} 