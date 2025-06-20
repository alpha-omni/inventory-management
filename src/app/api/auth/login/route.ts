import { NextRequest, NextResponse } from 'next/server'
import { authService } from '@/services/authService'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Basic validation
    const { email, password } = body
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' }, 
        { status: 400 }
      )
    }

    const result = await authService.login({
      email,
      password
    })

    return NextResponse.json(result, { status: 200 })
  } catch (error) {
    console.error('Login error:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message }, 
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
} 