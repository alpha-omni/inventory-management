'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { api } from '@/lib/api'

interface Site {
  id: string
  name: string
  address?: string
}

interface StockArea {
  id: string
  name: string
  siteId: string
  companyId: string
  createdAt: string
  updatedAt: string
  site: Site
  _count: {
    inventory: number
  }
}

export default function StockAreasPage() {
  const [stockAreas, setStockAreas] = useState<StockArea[]>([])
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingStockArea, setEditingStockArea] = useState<StockArea | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    siteId: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [stockAreasData, sitesData] = await Promise.all([
        api.getStockAreas(),
        api.getSites()
      ])
      setStockAreas(stockAreasData)
      setSites(sitesData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingStockArea) {
        await api.updateStockArea(editingStockArea.id, { name: formData.name })
      } else {
        await api.createStockArea(formData)
      }
      
      await loadData()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save stock area')
    }
  }

  const handleEdit = (stockArea: StockArea) => {
    setEditingStockArea(stockArea)
    setFormData({
      name: stockArea.name,
      siteId: stockArea.siteId
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this stock area?')) return

    try {
      await api.deleteStockArea(id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete stock area')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', siteId: '' })
    setEditingStockArea(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading stock areas...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Stock Areas
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage storage areas within your hospital sites
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={sites.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Stock Area
          </button>
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

        {/* No Sites Warning */}
        {sites.length === 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <div className="text-yellow-800 dark:text-yellow-200">
              <h3 className="font-medium">No Sites Available</h3>
              <p className="mt-1 text-sm">
                You need to create at least one hospital site before adding stock areas.
              </p>
              <a 
                href="/sites"
                className="mt-2 inline-block text-sm underline hover:no-underline"
              >
                Go to Sites →
              </a>
            </div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingStockArea ? 'Edit Stock Area' : 'Add New Stock Area'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stock Area Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter stock area name"
                    />
                  </div>
                  
                  {!editingStockArea && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Hospital Site *
                      </label>
                      <select
                        required
                        value={formData.siteId}
                        onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Select a site</option>
                        {sites.map((site) => (
                          <option key={site.id} value={site.id}>
                            {site.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {editingStockArea ? 'Update' : 'Create'} Stock Area
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Stock Areas List */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            {stockAreas.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">📦</span>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No stock areas</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {sites.length === 0 
                    ? 'Create a hospital site first, then add stock areas.'
                    : 'Get started by creating your first stock area.'
                  }
                </p>
                {sites.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={() => setShowForm(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Add Stock Area
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {stockAreas.map((stockArea) => (
                  <div key={stockArea.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">📦</span>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {stockArea.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                              🏥 {stockArea.site.name}
                              {stockArea.site.address && (
                                <span className="ml-2">• 📍 {stockArea.site.address}</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {stockArea._count.inventory} inventory items
                        </span>
                        <button
                          onClick={() => handleEdit(stockArea)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(stockArea.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(stockArea.createdAt).toLocaleDateString()}
                      {stockArea.updatedAt !== stockArea.createdAt && (
                        <span className="ml-4">
                          Updated: {new Date(stockArea.updatedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
} 