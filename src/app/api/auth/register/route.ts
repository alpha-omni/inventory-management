import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    const { email, password, name, companyName, companyEmail } = body
    
    if (!email || !password || !name || !companyName || !companyEmail) {
      return NextResponse.json(
        { error: 'All fields are required' }, 
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email) || !emailRegex.test(companyEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      )
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' }, 
        { status: 400 }
      )
    }

    const result = await authService.register({
      email,
      password,
      name,
      companyName,
      companyEmail
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 