import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

// Paths that don't require authentication
const publicPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/login',
  '/register',
]

// Exact paths that don't require authentication
const exactPublicPaths = ['/']

// Paths that require authentication
const protectedApiPaths = [
  '/api/sites',
  '/api/items',
  '/api/inventory',
  '/api/stock-areas',
  '/api/dashboard',
  '/api/medications',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow exact public paths
  if (exactPublicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // Allow public paths with startsWith
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check if it's a protected API path
  if (protectedApiPaths.some(path => pathname.startsWith(path))) {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Add user info to headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', payload.userId)
    requestHeaders.set('x-company-id', payload.companyId)
    requestHeaders.set('x-user-role', payload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // For other paths, allow them to pass through
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
} 