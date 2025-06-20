'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/components/LoginForm'

interface LoginData {
  email: string
  password: string
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (data: LoginData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Login failed')
      }

      // Store token in localStorage (in production, consider more secure options)
      localStorage.setItem('auth-token', result.token)
      localStorage.setItem('user-data', JSON.stringify(result.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Hospital Inventory Management
          </h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Sign in to manage your inventory
          </p>
        </div>
        
        <LoginForm 
          onLogin={handleLogin}
          loading={loading}
          error={error}
        />

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-green-600 hover:text-green-500">
              Register here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 