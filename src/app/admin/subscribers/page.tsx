'use client'
import { useState, useEffect, useMemo } from 'react'
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
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [sortBy, setSortBy] = useState<'date' | 'email'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

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
      if (response.ok) fetchSubscribers()
    } catch (error) {
      console.error('Error updating subscriber:', error)
    }
  }

  const deleteSubscriber = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este suscriptor?')) return
    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
      if (response.ok) fetchSubscribers()
    } catch (error) {
      console.error('Error deleting subscriber:', error)
    }
  }

  const exportToCSV = () => {
    const activeSubscribers = subscribers.filter(s => s.is_active)
    const csvContent = [
      ['Email', 'Estado', 'Fecha de suscripción'],
      ...activeSubscribers.map(s => [
        s.email,
        s.is_active ? 'Activo' : 'Inactivo',
        new Date(s.subscribed_at).toLocaleDateString('es-ES')
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `suscriptores-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const copyAllEmails = async () => {
    const activeSubscribers = subscribers.filter(s => s.is_active)
    if (activeSubscribers.length === 0) {
      setCopyStatus('error')
      setTimeout(() => setCopyStatus('idle'), 2000)
      return
    }
    const emailsText = activeSubscribers.map(s => s.email).join(', ')
    try {
      await navigator.clipboard.writeText(emailsText)
      setCopyStatus('success')
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = emailsText
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand('copy')
        setCopyStatus('success')
      } catch {
        setCopyStatus('error')
      }
      document.body.removeChild(textArea)
    }
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const filteredAndSortedSubscribers = useMemo(() => {
    let result = subscribers.filter(subscriber => {
      const matchesFilter = filter === 'all' || 
        (filter === 'active' && subscriber.is_active) ||
        (filter === 'inactive' && !subscriber.is_active)
      const matchesSearch = subscriber.email.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesFilter && matchesSearch
    })

    result.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.subscribed_at).getTime()
        const dateB = new Date(b.subscribed_at).getTime()
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA
      } else {
        return sortOrder === 'asc' 
          ? a.email.localeCompare(b.email)
          : b.email.localeCompare(a.email)
      }
    })

    return result
  }, [subscribers, filter, searchTerm, sortBy, sortOrder])

  const stats = useMemo(() => ({
    total: subscribers.length,
    active: subscribers.filter(s => s.is_active).length,
    inactive: subscribers.filter(s => !s.is_active).length,
  }), [subscribers])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Cargando suscriptores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Gestión de Suscriptores</h1>
                <p className="text-sm text-slate-400">Total: {stats.total} | Activos: {stats.active} | Inactivos: {stats.inactive}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={copyAllEmails}
                className={`px-4 py-2.5 rounded-xl flex items-center space-x-2 transition-all duration-300 ${
                  copyStatus === 'success' ? 'bg-emerald-600 text-white' :
                  copyStatus === 'error' ? 'bg-red-600 text-white' :
                  'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 hover:border-emerald-500/50'
                }`}
              >
                {copyStatus === 'success' ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg><span className="text-sm font-medium">¡Copiados!</span></>
                ) : copyStatus === 'error' ? (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg><span className="text-sm font-medium">Error</span></>
                ) : (
                  <><svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg><span className="text-sm font-medium">Copiar emails ({stats.active})</span></>
                )}
              </button>
              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center space-x-2 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="text-sm font-medium">Exportar CSV</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Total</span>
              <span className="text-2xl font-bold text-white">{stats.total}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-emerald-400">Activos</span>
              <span className="text-2xl font-bold text-emerald-400">{stats.active}</span>
            </div>
          </div>
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-4 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-red-400">Inactivos</span>
              <span className="text-2xl font-bold text-red-400">{stats.inactive}</span>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-slate-400 mb-2">Buscar por email</label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Estado</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="date">Fecha</option>
                <option value="email">Email</option>
              </select>
            </div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white hover:border-emerald-500/50 transition-colors flex items-center space-x-2"
            >
              <svg className={`w-4 h-4 transition-transform ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
              <span className="text-sm">{sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}</span>
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Fecha de suscripción</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredAndSortedSubscribers.map((subscriber) => (
                  <tr key={subscriber.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${subscriber.is_active ? 'bg-emerald-400' : 'bg-red-400'}`}></div>
                        <span className="text-sm font-medium text-white">{subscriber.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        subscriber.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {subscriber.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(subscriber.subscribed_at).toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {subscriber.is_active ? (
                          <button
                            onClick={() => updateSubscriberStatus(subscriber.id, false)}
                            className="px-3 py-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg border border-amber-500/20 transition-colors"
                          >
                            Desactivar
                          </button>
                        ) : (
                          <button
                            onClick={() => updateSubscriberStatus(subscriber.id, true)}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg border border-emerald-500/20 transition-colors"
                          >
                            Reactivar
                          </button>
                        )}
                        <button
                          onClick={() => deleteSubscriber(subscriber.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-colors"
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

          {filteredAndSortedSubscribers.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-slate-500">No se encontraron suscriptores con los filtros aplicados.</p>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="mt-6 text-center text-sm text-slate-500">
          Mostrando {filteredAndSortedSubscribers.length} de {stats.total} suscriptores
        </div>
      </main>
    </div>
  )
}
