'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { api } from '@/lib/api'
import LineChart from '@/components/charts/LineChart'
import BarChart from '@/components/charts/BarChart'
import PieChart from '@/components/charts/PieChart'

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

interface InventoryTrend {
  date: string
  totalItems: number
  lowStockCount: number
  outOfStockCount: number
}

interface UsageAnalytics {
  itemId: string
  itemName: string
  itemType: 'MEDICATION' | 'SUPPLY'
  totalAdjustments: number
  averageUsage: number
  currentStock: number
  predictedDaysRemaining: number
  isHighUsage: boolean
  safetyFlags: {
    isHazardous: boolean
    isHighAlert: boolean
    isLASA: boolean
  }
}

interface ComplianceMetrics {
  totalMedications: number
  hazardousCount: number
  highAlertCount: number
  lasaCount: number
  complianceScore: number
  criticalAlerts: Array<{
    type: string
    message: string
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    itemId?: string
    itemName?: string
  }>
}

interface SitePerformance {
  siteId: string
  siteName: string
  totalItems: number
  stockAreas: number
  inventoryCount: number
  lowStockItems: number
  outOfStockItems: number
  efficiencyScore: number
  lastUpdated: string
}

interface PredictiveAlert {
  type: string
  message: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  daysUntilCritical: number
  itemName: string
  currentStock: number
  predictedOutOfStock: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [trends, setTrends] = useState<InventoryTrend[]>([])
  const [usageAnalytics, setUsageAnalytics] = useState<UsageAnalytics[]>([])
  const [compliance, setCompliance] = useState<ComplianceMetrics | null>(null)
  const [sitePerformance, setSitePerformance] = useState<SitePerformance[]>([])
  const [predictiveAlerts, setPredictiveAlerts] = useState<PredictiveAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load all analytics data in parallel
        const [
          dashboardStats,
          inventoryTrends,
          usageData,
          complianceData,
          siteData,
          alertsData
        ] = await Promise.all([
          api.getDashboardStats(),
          api.getInventoryTrends(30),
          api.getUsageAnalytics(),
          api.getComplianceMetrics(),
          api.getSitePerformance(),
          api.getPredictiveAlerts()
        ])

        setStats(dashboardStats)
        setTrends(inventoryTrends)
        setUsageAnalytics(usageData)
        setCompliance(complianceData)
        setSitePerformance(siteData)
        setPredictiveAlerts(alertsData)
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
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading analytics dashboard...</p>
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

  // Prepare chart data
  const trendLines = [
    { dataKey: 'totalItems', stroke: '#10B981', name: 'Total Items' },
    { dataKey: 'lowStockCount', stroke: '#F59E0B', name: 'Low Stock' },
    { dataKey: 'outOfStockCount', stroke: '#EF4444', name: 'Out of Stock' }
  ]

  const usageChartData = usageAnalytics.slice(0, 10).map(item => ({
    name: item.itemName,
    usage: item.totalAdjustments,
    stock: item.currentStock,
    daysRemaining: item.predictedDaysRemaining
  }))

  const compliancePieData = compliance ? [
    { name: 'Hazardous', value: compliance.hazardousCount, color: '#F97316' },
    { name: 'High Alert', value: compliance.highAlertCount, color: '#EF4444' },
    { name: 'LASA', value: compliance.lasaCount, color: '#F59E0B' },
    { name: 'Regular', value: compliance.totalMedications - compliance.hazardousCount - compliance.highAlertCount - compliance.lasaCount, color: '#10B981' }
  ] : []

  const siteEfficiencyData = sitePerformance.map(site => ({
    name: site.siteName,
    efficiency: site.efficiencyScore,
    lowStock: site.lowStockItems,
    outOfStock: site.outOfStockItems
  }))

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Advanced inventory insights and business intelligence
            </p>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'trends', label: 'Trends' },
              { id: 'compliance', label: 'Compliance' },
              { id: 'sites', label: 'Sites' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Items */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-md flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-lg">📋</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Total Inventory
                    </dt>
                    <dd className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats?.inventory.totalItems || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Score */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-lg">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Compliance Score
                    </dt>
                    <dd className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {compliance?.complianceScore || 0}%
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-md flex items-center justify-center">
                    <span className="text-red-600 dark:text-red-400 text-lg">⚠️</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Critical Alerts
                    </dt>
                    <dd className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {(compliance?.criticalAlerts.length || 0) + predictiveAlerts.filter(a => a.priority === 'HIGH').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Predictive Insights */}
          <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-md flex items-center justify-center">
                    <span className="text-purple-600 dark:text-purple-400 text-lg">🔮</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                      Predicted Stockouts
                    </dt>
                    <dd className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {predictiveAlerts.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Inventory Trends */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Inventory Trends (30 days)
                </h3>
              </div>
              <div className="p-6">
                <LineChart
                  data={trends}
                  lines={trendLines}
                  xAxisDataKey="date"
                  height={350}
                />
              </div>
            </div>

            {/* Top Usage Items */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Top Usage Items
                </h3>
              </div>
              <div className="p-6">
                <BarChart
                  data={usageChartData}
                  bars={[
                    { dataKey: 'usage', fill: '#3B82F6', name: 'Usage' },
                    { dataKey: 'stock', fill: '#10B981', name: 'Current Stock' }
                  ]}
                  xAxisDataKey="name"
                  height={350}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Extended Trends Chart */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Detailed Inventory Trends
                </h3>
              </div>
              <div className="p-6">
                <LineChart
                  data={trends}
                  lines={trendLines}
                  xAxisDataKey="date"
                  height={500}
                />
              </div>
            </div>

            {/* Usage Analytics Table */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Usage Analytics
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Days Remaining
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {usageAnalytics.slice(0, 10).map((item) => (
                      <tr key={item.itemId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {item.itemName}
                          {(item.safetyFlags.isHazardous || item.safetyFlags.isHighAlert || item.safetyFlags.isLASA) && (
                            <span className="ml-2 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                              Safety
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {item.itemType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.totalAdjustments}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {item.currentStock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${
                            item.predictedDaysRemaining <= 7 
                              ? 'text-red-600 dark:text-red-400' 
                              : item.predictedDaysRemaining <= 14 
                              ? 'text-yellow-600 dark:text-yellow-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}>
                            {item.predictedDaysRemaining} days
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'compliance' && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Compliance Overview */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Safety Medication Distribution
                </h3>
              </div>
              <div className="p-6">
                <PieChart data={compliancePieData} height={350} />
              </div>
            </div>

            {/* Critical Alerts */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Critical Safety Alerts
                </h3>
              </div>
              <div className="p-6 space-y-4">
                {compliance?.criticalAlerts.slice(0, 5).map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.priority === 'HIGH'
                        ? 'bg-red-50 dark:bg-red-900 border-red-400'
                        : alert.priority === 'MEDIUM'
                        ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-400'
                        : 'bg-blue-50 dark:bg-blue-900 border-blue-400'
                    }`}
                  >
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.priority === 'HIGH'
                            ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : alert.priority === 'MEDIUM'
                            ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                            : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        }`}>
                          {alert.priority}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900 dark:text-white">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sites' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Site Performance Chart */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Site Efficiency Scores
                </h3>
              </div>
              <div className="p-6">
                <BarChart
                  data={siteEfficiencyData}
                  bars={[
                    { dataKey: 'efficiency', fill: '#10B981', name: 'Efficiency Score' }
                  ]}
                  xAxisDataKey="name"
                  height={350}
                />
              </div>
            </div>

            {/* Site Performance Table */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Site Performance Details
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Site Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Stock Areas
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Total Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Low Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Efficiency
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sitePerformance.map((site) => (
                      <tr key={site.siteId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {site.siteName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {site.stockAreas}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {site.totalItems}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">
                          {site.lowStockItems}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-10 h-10">
                              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className={`text-xs font-bold ${
                                  site.efficiencyScore >= 80
                                    ? 'text-green-600 dark:text-green-400'
                                    : site.efficiencyScore >= 60
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-red-600 dark:text-red-400'
                                }`}>
                                  {site.efficiencyScore}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Predictive Alerts Section */}
        {predictiveAlerts.length > 0 && (
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                🔮 Predictive Stock Alerts
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered predictions for upcoming stock issues
              </p>
            </div>
            <div className="p-6 space-y-4">
              {predictiveAlerts.slice(0, 5).map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${
                    alert.priority === 'HIGH'
                      ? 'bg-red-50 dark:bg-red-900 border-red-400'
                      : alert.priority === 'MEDIUM'
                      ? 'bg-yellow-50 dark:bg-yellow-900 border-yellow-400'
                      : 'bg-blue-50 dark:bg-blue-900 border-blue-400'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          alert.priority === 'HIGH'
                            ? 'bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200'
                            : alert.priority === 'MEDIUM'
                            ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                            : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                        }`}>
                          {alert.daysUntilCritical} days
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{alert.itemName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900 dark:text-white">Stock: {alert.currentStock}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Est. out: {alert.predictedOutOfStock}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
} 