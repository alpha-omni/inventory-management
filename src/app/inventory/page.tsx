'use client'

import { useEffect, useState, useMemo } from 'react'
import { Layout } from '@/components/Layout'
import { api } from '@/lib/api'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table'

interface InventoryItem {
  id: string
  currentQuantity: number
  maxCapacity?: number
  reorderThreshold?: number
  stockAreaId: string
  itemId: string
  companyId: string
  createdAt: string
  updatedAt: string
  item: {
    id: string
    name: string
    type: 'MEDICATION' | 'SUPPLY'
    drugId?: string
    isHazardous: boolean
    isHighAlert: boolean
    isLASA: boolean
  }
  stockArea: {
    id: string
    name: string
    site: {
      id: string
      name: string
    }
  }
}

interface Site {
  id: string
  name: string
}

interface StockArea {
  id: string
  name: string
  siteId: string
  site: Site
}

interface Item {
  id: string
  name: string
  type: 'MEDICATION' | 'SUPPLY'
}

const columnHelper = createColumnHelper<InventoryItem>()

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  // const [sites, setSites] = useState<Site[]>([])
  const [stockAreas, setStockAreas] = useState<StockArea[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [showAdjustForm, setShowAdjustForm] = useState(false)
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null)
  const [adjustingInventory, setAdjustingInventory] = useState<InventoryItem | null>(null)
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [formData, setFormData] = useState({
    itemId: '',
    stockAreaId: '',
    currentQuantity: 0,
    maxCapacity: 0,
    reorderThreshold: 0
  })
  const [adjustmentData, setAdjustmentData] = useState({
    adjustment: 0,
    reason: ''
  })

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentQuantity === 0) return 'out'
    if (item.reorderThreshold && item.currentQuantity <= item.reorderThreshold) return 'low'
    return 'good'
  }

  const columns = useMemo(() => [
    columnHelper.accessor('item.name', {
      header: 'Item',
      cell: (info) => (
        <div className="flex items-center">
          <span className="text-lg mr-2">
            {info.row.original.item.type === 'MEDICATION' ? '💊' : '📦'}
          </span>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {info.getValue()}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {info.row.original.item.type}
              {info.row.original.item.drugId && ` • ${info.row.original.item.drugId}`}
            </div>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('stockArea.name', {
      header: 'Location',
      cell: (info) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {info.row.original.stockArea.site.name}
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('currentQuantity', {
      header: 'Quantity',
      cell: (info) => {
        const status = getStockStatus(info.row.original)
        return (
          <div className="flex items-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'out' 
                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                : status === 'low'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {info.getValue()}
              {info.row.original.maxCapacity && ` / ${info.row.original.maxCapacity}`}
            </span>
          </div>
        )
      },
    }),
    columnHelper.accessor('reorderThreshold', {
      header: 'Reorder At',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.display({
      id: 'safety',
      header: 'Safety',
      cell: (info) => (
        <div className="flex space-x-1">
          {info.row.original.item.isHazardous && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
              HAZ
            </span>
          )}
          {info.row.original.item.isHighAlert && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
              HIGH
            </span>
          )}
          {info.row.original.item.isLASA && (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
              LASA
            </span>
          )}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: (info) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAdjust(info.row.original)}
            className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 text-sm"
          >
            Adjust
          </button>
          <button
            onClick={() => handleEdit(info.row.original)}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(info.row.original.id)}
            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-sm"
          >
            Delete
          </button>
        </div>
      ),
    }),
  ], [handleDelete])

  const table = useReactTable({
    data: inventory,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [inventoryData, , stockAreasData, itemsData] = await Promise.all([
        api.getInventory(),
        api.getSites(),
        api.getStockAreas(),
        api.getItems()
      ])
      setInventory(inventoryData)
      // setSites(sitesData)
      setStockAreas(stockAreasData)
      setItems(itemsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingInventory) {
        await api.updateInventory(editingInventory.id, formData)
      } else {
        await api.createInventory(formData)
      }
      
      await loadData()
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save inventory')
    }
  }

  const handleAdjustmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!adjustingInventory) return

    try {
      await api.adjustInventory(adjustingInventory.id, adjustmentData.adjustment)
      await loadData()
      resetAdjustForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to adjust inventory')
    }
  }

  const handleEdit = (item: InventoryItem) => {
    setEditingInventory(item)
    setFormData({
      itemId: item.itemId,
      stockAreaId: item.stockAreaId,
      currentQuantity: item.currentQuantity,
      maxCapacity: item.maxCapacity || 0,
      reorderThreshold: item.reorderThreshold || 0
    })
    setShowForm(true)
  }

  const handleAdjust = (item: InventoryItem) => {
    setAdjustingInventory(item)
    setAdjustmentData({
      adjustment: 0,
      reason: ''
    })
    setShowAdjustForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory record?')) return

    try {
      await api.deleteInventory(id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inventory')
    }
  }

  const resetForm = () => {
    setFormData({
      itemId: '',
      stockAreaId: '',
      currentQuantity: 0,
      maxCapacity: 0,
      reorderThreshold: 0
    })
    setEditingInventory(null)
    setShowForm(false)
  }

  const resetAdjustForm = () => {
    setAdjustmentData({
      adjustment: 0,
      reason: ''
    })
    setAdjustingInventory(null)
    setShowAdjustForm(false)
  }

  // const filteredStockAreas = stockAreas.filter(area => 
  //   formData.stockAreaId ? area.id === formData.stockAreaId : true
  // )

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading inventory...</p>
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
              Inventory Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Track and manage your inventory levels across all locations
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={stockAreas.length === 0 || items.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Inventory
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

        {/* Prerequisites Warning */}
        {(stockAreas.length === 0 || items.length === 0) && (
          <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
            <div className="text-yellow-800 dark:text-yellow-200">
              <h3 className="font-medium">Setup Required</h3>
              <p className="mt-1 text-sm">
                You need to create {stockAreas.length === 0 ? 'stock areas' : ''} 
                {stockAreas.length === 0 && items.length === 0 ? ' and ' : ''}
                {items.length === 0 ? 'items' : ''} before managing inventory.
              </p>
              <div className="mt-2 space-x-2">
                {stockAreas.length === 0 && (
                  <a href="/stock-areas" className="text-sm underline hover:no-underline">
                    Go to Stock Areas →
                  </a>
                )}
                {items.length === 0 && (
                  <a href="/items" className="text-sm underline hover:no-underline">
                    Go to Items →
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search inventory..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div className="flex space-x-2">
              <select
                value={(table.getColumn('item.type')?.getFilterValue() as string) ?? ''}
                onChange={(e) => table.getColumn('item.type')?.setFilterValue(e.target.value || undefined)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">All Types</option>
                <option value="MEDICATION">Medications</option>
                <option value="SUPPLY">Supplies</option>
              </select>
              <button
                onClick={() => table.getColumn('currentQuantity')?.setFilterValue(0)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                Out of Stock
              </button>
              <button
                onClick={() => table.resetColumnFilters()}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  {editingInventory ? 'Edit Inventory' : 'Add New Inventory'}
                </h3>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Item *
                    </label>
                    <select
                      required
                      disabled={!!editingInventory}
                      value={formData.itemId}
                      onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select an item</option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.type === 'MEDICATION' ? '💊' : '📦'} {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Stock Area *
                    </label>
                    <select
                      required
                      disabled={!!editingInventory}
                      value={formData.stockAreaId}
                      onChange={(e) => setFormData({ ...formData, stockAreaId: e.target.value })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    >
                      <option value="">Select a stock area</option>
                      {stockAreas.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.name} ({area.site.name})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Current Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.currentQuantity}
                      onChange={(e) => setFormData({ ...formData, currentQuantity: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Max Capacity
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxCapacity}
                      onChange={(e) => setFormData({ ...formData, maxCapacity: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Reorder Threshold
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.reorderThreshold}
                      onChange={(e) => setFormData({ ...formData, reorderThreshold: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      {editingInventory ? 'Update' : 'Create'} Inventory
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Adjustment Modal */}
        {showAdjustForm && adjustingInventory && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Adjust Inventory: {adjustingInventory.item.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Current Quantity: <strong>{adjustingInventory.currentQuantity}</strong>
                </p>
                
                <form onSubmit={handleAdjustmentSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Adjustment *
                    </label>
                    <input
                      type="number"
                      required
                      value={adjustmentData.adjustment}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, adjustment: Number(e.target.value) })}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Enter adjustment (+ to add, - to subtract)"
                    />
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    New quantity will be: <strong>{adjustingInventory.currentQuantity + adjustmentData.adjustment}</strong>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={resetAdjustForm}
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      Apply Adjustment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <th
                        key={header.id}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center space-x-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-6 py-12 text-center">
                      <div className="text-gray-500 dark:text-gray-400">
                        <span className="text-4xl block mb-2">📋</span>
                        <p className="text-sm">No inventory found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing <span className="font-medium">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}
                  </span> of{' '}
                  <span className="font-medium">{table.getFilteredRowModel().rows.length}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    ««
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    «
                  </button>
                  <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </span>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    »»
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
} 