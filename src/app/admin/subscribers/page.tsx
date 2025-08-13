'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Subscriber {
  id: string
  email: string
  status: 'pending' | 'active' | 'unsubscribed'
  created_at: string
  confirmed_at?: string
  unsubscribed_at?: string
}

export default function SubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch('/api/admin/subscribers')
      if (!response.ok) throw new Error('Error al cargar suscriptores')
      const data = await response.json()
      setSubscribers(data.subscribers || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/subscribers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      
      if (!response.ok) throw new Error('Error al actualizar estado')
      
      // Actualizar estado local
      setSubscribers(prev => prev.map(sub => 
        sub.id === id ? { ...sub, status: newStatus as any } : sub
      ))
      
      alert('Estado actualizado exitosamente')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este suscriptor? Esta acción no se puede deshacer.')) return
    
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar suscriptor')
      
      setSubscribers(prev => prev.filter(sub => sub.id !== id))
      alert('Suscriptor eliminado exitosamente')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const exportSubscribers = () => {
    const csvContent = [
      ['Email', 'Estado', 'Fecha de Creación', 'Fecha de Confirmación', 'Fecha de Baja'],
      ...subscribers.map(sub => [
        sub.email,
        sub.status,
        new Date(sub.created_at).toLocaleDateString('es-ES'),
        sub.confirmed_at ? new Date(sub.confirmed_at).toLocaleDateString('es-ES') : '',
        sub.unsubscribed_at ? new Date(sub.unsubscribed_at).toLocaleDateString('es-ES') : ''
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `suscriptores-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-green-100 text-green-800',
      unsubscribed: 'bg-red-100 text-red-800'
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.pending}`
  }

  const getStatusText = (status: string) => {
    const texts = {
      pending: 'Pendiente',
      active: 'Activo',
      unsubscribed: 'Dado de baja'
    }
    return texts[status as keyof typeof texts] || status
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Filtrar suscriptores
  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || sub.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) return <div className="p-8 text-center">Cargando suscriptores...</div>
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suscriptores</h1>
              <p className="mt-2 text-gray-600">Gestiona tu lista de suscriptores</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={exportSubscribers}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">
              {subscribers.length}
            </div>
            <div className="text-gray-600">Total</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {subscribers.filter(s => s.status === 'pending').length}
            </div>
            <div className="text-gray-600">Pendientes</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {subscribers.filter(s => s.status === 'active').length}
            </div>
            <div className="text-gray-600">Activos</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {subscribers.filter(s => s.status === 'unsubscribed').length}
            </div>
            <div className="text-gray-600">Dados de baja</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por email
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar suscriptores..."
                className="input-field w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrar por estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field w-full"
              >
                <option value="all">Todos los estados</option>
                <option value="pending">Pendientes</option>
                <option value="active">Activos</option>
                <option value="unsubscribed">Dados de baja</option>
              </select>
            </div>
          </div>
        </div>

        {/* Subscribers List */}
        <div className="bg-white shadow rounded-lg">
          {filteredSubscribers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-4">
                {subscribers.length === 0 ? 'No hay suscriptores aún' : 'No se encontraron suscriptores con los filtros aplicados'}
              </p>
              {subscribers.length === 0 && (
                <p className="text-sm">Los suscriptores aparecerán aquí cuando se registren en tu newsletter</p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
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
                      Fecha de Registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de Confirmación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {subscriber.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(subscriber.status)}>
                          {getStatusText(subscriber.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(subscriber.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {subscriber.confirmed_at ? formatDate(subscriber.confirmed_at) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {subscriber.status === 'pending' && (
                            <button
                              onClick={() => handleStatusChange(subscriber.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Activar
                            </button>
                          )}
                          {subscriber.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(subscriber.id, 'unsubscribed')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Dar de baja
                            </button>
                          )}
                          {subscriber.status === 'unsubscribed' && (
                            <button
                              onClick={() => handleStatusChange(subscriber.id, 'active')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Reactivar
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(subscriber.id)}
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
          )}
        </div>

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <Link
            href="/admin"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver al Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
} 