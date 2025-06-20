'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  name: string
  role: string
  companyId: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth-token')
    const userData = localStorage.getItem('user-data')

    if (!token || !userData) {
      router.push('/login')
      return
    }

    try {
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)
    } catch (error) {
      console.error('Error parsing user data:', error)
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('auth-token')
    localStorage.removeItem('user-data')
    router.push('/login')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Inventory Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Welcome back, {user.name}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🎉 Authentication Successful!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Your hospital inventory management system is ready to use.
              </p>
              
              <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg mb-6">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-2">
                  User Information
                </h3>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p><strong>Name:</strong> {user.name}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role}</p>
                  <p><strong>Company ID:</strong> {user.companyId}</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                🚧 Dashboard features are coming soon! The authentication system is working perfectly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 