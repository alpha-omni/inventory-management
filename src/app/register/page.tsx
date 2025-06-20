'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RegisterForm } from '@/components/RegisterForm'

interface RegisterData {
  email: string
  password: string
  name: string
  companyName: string
  companyEmail: string
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleRegister = async (data: RegisterData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      // Store token in localStorage (in production, consider more secure options)
      localStorage.setItem('auth-token', result.token)
      localStorage.setItem('user-data', JSON.stringify(result.user))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
            Hospital Inventory Management
          </h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Register your hospital to get started
          </p>
        </div>
        
        <RegisterForm 
          onRegister={handleRegister}
          loading={loading}
          error={error}
        />

        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <a href="/login" className="text-green-600 hover:text-green-500">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 