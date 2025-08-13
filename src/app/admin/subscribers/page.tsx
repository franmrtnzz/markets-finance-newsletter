'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Subscriber {
  id: string
  email: string
  is_active: boolean
  subscribed_at: string
  unsubscribe_token: string
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSubscriberStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/subscribers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })

      if (response.ok) {
        fetchSubscribers() // Recargar lista
      }
    } catch (error) {
      console.error('Error updating subscriber:', error)
    }
  }

  const deleteSubscriber = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este suscriptor?')) return

    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchSubscribers() // Recargar lista
      }
    } catch (error) {
      console.error('Error deleting subscriber:', error)
    }
  }

  const exportToCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active)
    const csvContent = [
      ['Email', 'Fecha de suscripción'],
      ...activeSubscribers.map(s => [
        s.email,
        new Date(s.subscribed_at).toLocaleDateString('es-ES')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'suscriptores-activos.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesFilter = filter === 'all' || 
      (filter === 'active' && subscriber.is_active) ||
      (filter === 'inactive' && !subscriber.is_active)
    
    const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">Cargando suscriptores...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suscriptores</h1>
              <p className="text-gray-600 mt-2">
                Total: {subscribers.length} | Activos: {subscribers.filter(s => s.is_active).length}
              </p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Exportar CSV
              </button>
              <Link
                href="/admin"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por estado
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por email
              </label>
              <input
                type="text"
                placeholder="Buscar email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Tabla de suscriptores */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de suscripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {subscriber.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      subscriber.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {subscriber.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(subscriber.subscribed_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {subscriber.is_active ? (
                        <button
                          onClick={() => updateSubscriberStatus(subscriber.id, false)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Desactivar
                        </button>
                      ) : (
                        <button
                          onClick={() => updateSubscriberStatus(subscriber.id, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Reactivar
                        </button>
                      )}
                      <button
                        onClick={() => deleteSubscriber(subscriber.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No se encontraron suscriptores con los filtros aplicados.
          </div>
        )}
      </div>
    </div>
  )
} 