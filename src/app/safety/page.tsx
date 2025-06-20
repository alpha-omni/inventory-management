'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { api } from '@/lib/api'

interface SafetyAlert {
  id: string
  name: string
  description?: string
  drugId?: string
  isHazardous: boolean
  isHighAlert: boolean
  isLASA: boolean
  inventoryCount: number
  locations: string[]
}

export default function SafetyPage() {
  const [alerts, setAlerts] = useState<SafetyAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'hazardous' | 'high-alert' | 'lasa'>('all')

  useEffect(() => {
    loadSafetyAlerts()
  }, [])

  const loadSafetyAlerts = async () => {
    try {
      setLoading(true)
      const data = await api.getSafetyAlerts()
      setAlerts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load safety alerts')
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    switch (activeFilter) {
      case 'hazardous':
        return alert.isHazardous
      case 'high-alert':
        return alert.isHighAlert
      case 'lasa':
        return alert.isLASA
      default:
        return true
    }
  })

  const stats = {
    total: alerts.length,
    hazardous: alerts.filter(a => a.isHazardous).length,
    highAlert: alerts.filter(a => a.isHighAlert).length,
    lasa: alerts.filter(a => a.isLASA).length,
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading safety alerts...</p>
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
            Medication Safety Alerts
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Monitor high-risk medications and safety classifications
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
            <div className="text-red-800 dark:text-red-200">
              <h3 className="font-medium">Error</h3>
              <p className="mt-1 text-sm">{error}</p>
              <button 
                onClick={() => setError('')}
                className="mt-2 text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Medications */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">💊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Medications
                    </dt>
                    <dd className="text-lg font-medium text-gray-900 dark:text-white">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Hazardous */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">☢️</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Hazardous
                    </dt>
                    <dd className="text-lg font-medium text-orange-600 dark:text-orange-400">
                      {stats.hazardous}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* High Alert */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚨</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      High Alert
                    </dt>
                    <dd className="text-lg font-medium text-red-600 dark:text-red-400">
                      {stats.highAlert}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* LASA */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      LASA
                    </dt>
                    <dd className="text-lg font-medium text-yellow-600 dark:text-yellow-400">
                      {stats.lasa}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveFilter('all')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeFilter === 'all'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                All Medications ({stats.total})
              </button>
              <button
                onClick={() => setActiveFilter('hazardous')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeFilter === 'hazardous'
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Hazardous ({stats.hazardous})
              </button>
              <button
                onClick={() => setActiveFilter('high-alert')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeFilter === 'high-alert'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                High Alert ({stats.highAlert})
              </button>
              <button
                onClick={() => setActiveFilter('lasa')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeFilter === 'lasa'
                    ? 'border-yellow-500 text-yellow-600 dark:text-yellow-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                LASA ({stats.lasa})
              </button>
            </nav>
          </div>

          {/* Safety Alerts List */}
          <div className="p-6">
            {filteredAlerts.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">🔒</span>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No safety alerts found
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {activeFilter === 'all' 
                    ? 'No medications with safety classifications have been added yet.'
                    : `No medications with ${activeFilter.replace('-', ' ')} classification found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">💊</span>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {alert.name}
                            </h3>
                            {alert.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {alert.description}
                              </p>
                            )}
                            {alert.drugId && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Drug ID: {alert.drugId}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end space-y-2">
                        {/* Safety Flags */}
                        <div className="flex space-x-1">
                          {alert.isHazardous && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              ☢️ HAZARDOUS
                            </span>
                          )}
                          {alert.isHighAlert && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              🚨 HIGH ALERT
                            </span>
                          )}
                          {alert.isLASA && (
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              ⚠️ LASA
                            </span>
                          )}
                        </div>
                        
                        {/* Inventory Info */}
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {alert.inventoryCount} inventory records
                          </div>
                          {alert.locations.length > 0 && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Locations: {alert.locations.slice(0, 2).join(', ')}
                              {alert.locations.length > 2 && ` +${alert.locations.length - 2} more`}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Safety Information Box */}
                    <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-md p-3">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Safety Information
                      </h4>
                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        {alert.isHazardous && (
                          <div className="flex items-start">
                            <span className="text-orange-500 mr-2">•</span>
                            <span>
                              <strong>Hazardous Drug:</strong> Requires special handling procedures, personal protective equipment, and disposal protocols.
                            </span>
                          </div>
                        )}
                        {alert.isHighAlert && (
                          <div className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span>
                              <strong>High Alert Medication:</strong> Bears heightened risk of causing significant patient harm when used in error.
                            </span>
                          </div>
                        )}
                        {alert.isLASA && (
                          <div className="flex items-start">
                            <span className="text-yellow-600 mr-2">•</span>
                            <span>
                              <strong>LASA Drug:</strong> Look-alike/sound-alike medication with high potential for confusion. Extra verification required.
                            </span>
                          </div>
                        )}
                        {!alert.isHazardous && !alert.isHighAlert && !alert.isLASA && (
                          <div className="text-gray-500 dark:text-gray-400 italic">
                            No special safety classifications for this medication.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Safety Guidelines */}
        <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-4">
            Medication Safety Guidelines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-orange-800 dark:text-orange-200 mb-2">
                ☢️ Hazardous Drugs
              </h4>
              <ul className="text-orange-700 dark:text-orange-300 space-y-1">
                <li>• Use appropriate PPE</li>
                <li>• Handle in designated areas</li>
                <li>• Follow disposal protocols</li>
                <li>• Document exposure incidents</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">
                🚨 High Alert Medications
              </h4>
              <ul className="text-red-700 dark:text-red-300 space-y-1">
                <li>• Double-check all orders</li>
                <li>• Verify calculations</li>
                <li>• Use independent verification</li>
                <li>• Implement safety protocols</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ LASA Medications
              </h4>
              <ul className="text-yellow-700 dark:text-yellow-300 space-y-1">
                <li>• Read labels carefully</li>
                <li>• Use tall man lettering</li>
                <li>• Separate similar products</li>
                <li>• Confirm with second person</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 