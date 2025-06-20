class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ''
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth-token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }))
      throw new Error(error.error || `HTTP ${response.status}`)
    }
    return response.json()
  }

  async get(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  async post(endpoint: string, data?: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    })
    return this.handleResponse(response)
  }

  async put(endpoint: string, data: Record<string, unknown>) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    })
    return this.handleResponse(response)
  }

  async delete(endpoint: string) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    })
    return this.handleResponse(response)
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.get('/api/dashboard/stats')
  }

  // Sites endpoints
  async getSites() {
    return this.get('/api/sites')
  }

  async getSite(id: string) {
    return this.get(`/api/sites/${id}`)
  }

  async createSite(data: { name: string; address?: string }) {
    return this.post('/api/sites', data)
  }

  async updateSite(id: string, data: { name?: string; address?: string }) {
    return this.put(`/api/sites/${id}`, data)
  }

  async deleteSite(id: string) {
    return this.delete(`/api/sites/${id}`)
  }

  // Stock Areas endpoints
  async getStockAreas(siteId?: string) {
    const query = siteId ? `?siteId=${siteId}` : ''
    return this.get(`/api/stock-areas${query}`)
  }

  async getStockArea(id: string) {
    return this.get(`/api/stock-areas/${id}`)
  }

  async createStockArea(data: { name: string; siteId: string }) {
    return this.post('/api/stock-areas', data)
  }

  async updateStockArea(id: string, data: { name?: string }) {
    return this.put(`/api/stock-areas/${id}`, data)
  }

  async deleteStockArea(id: string) {
    return this.delete(`/api/stock-areas/${id}`)
  }

  // Items endpoints
  async getItems(filters?: {
    type?: 'MEDICATION' | 'SUPPLY'
    isHazardous?: boolean
    isHighAlert?: boolean
    isLASA?: boolean
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.get(`/api/items${query}`)
  }

  async getItem(id: string) {
    return this.get(`/api/items/${id}`)
  }

  async createItem(data: {
    name: string
    description?: string
    type: 'MEDICATION' | 'SUPPLY'
    drugId?: string
    isHazardous?: boolean
    isHighAlert?: boolean
    isLASA?: boolean
  }) {
    return this.post('/api/items', data)
  }

  async updateItem(id: string, data: Record<string, unknown>) {
    return this.put(`/api/items/${id}`, data)
  }

  async deleteItem(id: string) {
    return this.delete(`/api/items/${id}`)
  }

  // Inventory endpoints
  async getInventory(filters?: {
    siteId?: string
    stockAreaId?: string
    itemType?: 'MEDICATION' | 'SUPPLY'
    lowStock?: boolean
    search?: string
  }) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString())
        }
      })
    }
    const query = params.toString() ? `?${params.toString()}` : ''
    return this.get(`/api/inventory${query}`)
  }

  async getInventoryItem(id: string) {
    return this.get(`/api/inventory/${id}`)
  }

  async createInventory(data: {
    itemId: string
    stockAreaId: string
    currentQuantity: number
    maxCapacity?: number
    reorderThreshold?: number
  }) {
    return this.post('/api/inventory', data)
  }

  async updateInventory(id: string, data: Record<string, unknown>) {
    return this.put(`/api/inventory/${id}`, data)
  }

  async adjustInventory(id: string, adjustment: number) {
    return this.post(`/api/inventory/${id}/adjust`, { adjustment })
  }

  async deleteInventory(id: string) {
    return this.delete(`/api/inventory/${id}`)
  }

  // Safety endpoints
  async getSafetyAlerts() {
    return this.get('/api/medications/safety-alerts')
  }
}

export const api = new ApiClient() 