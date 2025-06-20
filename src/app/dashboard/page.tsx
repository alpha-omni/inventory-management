'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { api } from '@/lib/api'

interface DashboardStats {
  sites: {
    total: number
    withStockAreas: number
  }
  stockAreas: {
    total: number
    withInventory: number
  }
  items: {
    total: number
    medications: number
    supplies: number
    hazardous: number
    highAlert: number
    lasa: number
  }
  inventory: {
    totalItems: number
    lowStockCount: number
    outOfStockCount: number
  }
  safety: {
    totalMedications: number
    hazardousCount: number
    highAlertCount: number
    lasaCount: number
  }
  alerts: {
    lowStock: unknown[]
    outOfStock: number
    safetyMedications: number
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await api.getDashboardStats()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <div className="text-red-800 dark:text-red-200">
            <h3 className="font-medium">Error loading dashboard</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard Overview
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor your hospital inventory and safety compliance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Sites Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🏥</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Hospital Sites
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.sites.total || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.items.total || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Inventory Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📋</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Inventory Records
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.inventory.totalItems || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Low Stock Items
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats?.inventory.lowStockCount || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Inventory Breakdown */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Inventory Overview
              </h3>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Medications</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.items.medications || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Supplies</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.items.supplies || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Stock Areas</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.stockAreas.total || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Out of Stock</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {stats?.inventory.outOfStockCount || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Safety Compliance */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                Safety Compliance
              </h3>
              <div className="mt-5 space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Hazardous Items</span>
                  <span className="text-sm font-medium text-orange-600 dark:text-orange-400">
                    {stats?.safety.hazardousCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">High Alert</span>
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    {stats?.safety.highAlertCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">LASA Medications</span>
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                    {stats?.safety.lasaCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Safety Items</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {stats?.alerts.safetyMedications || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 