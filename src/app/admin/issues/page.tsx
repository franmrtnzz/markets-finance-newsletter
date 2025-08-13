'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Issue {
  id: string
  title: string
  slug: string
  status: 'draft' | 'scheduled' | 'sent'
  created_at: string
  scheduled_for?: string
  sent_at?: string
  subscriber_count?: number
}

export default function IssuesListPage() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchIssues()
  }, [])

  const fetchIssues = async () => {
    try {
      const response = await fetch('/api/admin/issues')
      if (!response.ok) throw new Error('Error al cargar newsletters')
      const data = await response.json()
      setIssues(data.issues || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres enviar este newsletter ahora?')) return
    
    try {
      const response = await fetch(`/api/admin/issues/${id}/send`, { method: 'POST' })
      if (!response.ok) throw new Error('Error al enviar newsletter')
      
      alert('Newsletter enviado exitosamente')
      fetchIssues() // Recargar lista
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al enviar')
    }
  }

  const handleSchedule = async (id: string) => {
    if (!confirm('¿Programar para el próximo domingo a las 08:00 UTC?')) return
    
    try {
      const response = await fetch(`/api/admin/issues/${id}/schedule`, { method: 'POST' })
      if (!response.ok) throw new Error('Error al programar newsletter')
      
      alert('Newsletter programado para el próximo domingo')
      fetchIssues() // Recargar lista
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al programar')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este newsletter? Esta acción no se puede deshacer.')) return
    
    try {
      const response = await fetch(`/api/admin/issues/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Error al eliminar newsletter')
      
      alert('Newsletter eliminado exitosamente')
      fetchIssues() // Recargar lista
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
      sent: 'bg-green-100 text-green-800'
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges] || badges.draft}`
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

  if (loading) return <div className="p-8 text-center">Cargando newsletters...</div>
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Newsletters</h1>
              <p className="mt-2 text-gray-600">Gestiona todos tus newsletters</p>
            </div>
            <Link
              href="/admin/issues/new"
              className="btn-primary"
            >
              Crear Newsletter
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {issues.filter(i => i.status === 'draft').length}
            </div>
            <div className="text-gray-600">Borradores</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">
              {issues.filter(i => i.status === 'scheduled').length}
            </div>
            <div className="text-gray-600">Programados</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {issues.filter(i => i.status === 'sent').length}
            </div>
            <div className="text-gray-600">Enviados</div>
          </div>
        </div>

        {/* Issues List */}
        <div className="bg-white shadow rounded-lg">
          {issues.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-lg mb-4">No hay newsletters aún</p>
              <Link href="/admin/issues/new" className="btn-primary">
                Crear tu primer newsletter
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Newsletter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Programado/Enviado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {issue.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {issue.slug}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(issue.status)}>
                          {issue.status === 'draft' && 'Borrador'}
                          {issue.status === 'scheduled' && 'Programado'}
                          {issue.status === 'sent' && 'Enviado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(issue.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {issue.scheduled_for && formatDate(issue.scheduled_for)}
                        {issue.sent_at && formatDate(issue.sent_at)}
                        {!issue.scheduled_for && !issue.sent_at && '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {issue.status === 'draft' && (
                            <>
                              <button
                                onClick={() => handleSend(issue.id)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Enviar
                              </button>
                              <button
                                onClick={() => handleSchedule(issue.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                Programar
                              </button>
                            </>
                          )}
                          {issue.status === 'scheduled' && (
                            <button
                              onClick={() => handleSend(issue.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Enviar Ahora
                            </button>
                          )}
                          <button
                            onClick={() => router.push(`/admin/issues/${issue.id}/edit`)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id)}
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