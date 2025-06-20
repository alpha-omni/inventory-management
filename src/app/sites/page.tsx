'use client'

import { useEffect, useState } from 'react'
import { Layout } from '@/components/Layout'
import { api } from '@/lib/api'

interface Site {
  id: string
  name: string
  address?: string
  companyId: string
  createdAt: string
  updatedAt: string
  _count: {
    stockAreas: number
  }
}

export default function SitesPage() {
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSite, setEditingSite] = useState<Site | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: ''
  })

  useEffect(() => {
    loadSites()
  }, [])

  const loadSites = async () => {
    try {
      setLoading(true)
      const data = await api.getSites()
      setSites(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sites')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingSite) {
        await api.updateSite(editingSite.id, formData)
      } else {
        await api.createSite(formData)
      }
      
      await loadSites()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save site')
    }
  }

  const handleEdit = (site: Site) => {
    setEditingSite(site)
    setFormData({
      name: site.name,
      address: site.address || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this site?')) return

    try {
      await api.deleteSite(id)
      await loadSites()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete site')
    }
  }

  const resetForm = () => {
    setFormData({ name: '', address: '' })
    setEditingSite(null)
    setShowForm(false)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading sites...</p>
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
              Hospital Sites
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your hospital locations and facilities
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Add Site
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

        {/* Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingSite ? 'Edit Site' : 'Add New Site'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Site Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter site name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter site address"
                    />
                  </div>
                  
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
                      {editingSite ? 'Update' : 'Create'} Site
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Sites List */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            {sites.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-4xl">🏥</span>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No sites</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Get started by creating your first hospital site.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    Add Site
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {sites.map((site) => (
                  <div key={site.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">🏥</span>
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {site.name}
                            </h3>
                            {site.address && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                📍 {site.address}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {site._count.stockAreas} stock areas
                        </span>
                        <button
                          onClick={() => handleEdit(site)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(site.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(site.createdAt).toLocaleDateString()}
                      {site.updatedAt !== site.createdAt && (
                        <span className="ml-4">
                          Updated: {new Date(site.updatedAt).toLocaleDateString()}
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