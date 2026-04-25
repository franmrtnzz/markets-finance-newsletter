'use client'

import { useState, useEffect, useMemo } from 'react'

interface Subscriber {
  id: string
  email: string
  is_active: boolean
  subscribed_at: string
}

export default function AdminSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [search, setSearch] = useState('')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success'>('idle')

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/subscribers')
      if (res.ok) {
        const data = await res.json()
        setSubscribers(data.subscribers || [])
      }
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const updateStatus = async (id: string, isActive: boolean) => {
    await fetch(`/api/admin/subscribers/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    })
    fetchData()
  }

  const deleteSubscriber = async (id: string) => {
    if (!confirm('¿Eliminar este suscriptor?')) return
    await fetch(`/api/admin/subscribers/${id}`, { method: 'DELETE' })
    fetchData()
  }

  const filtered = useMemo(() => {
    return subscribers
      .filter(s => {
        if (filter === 'active') return s.is_active
        if (filter === 'inactive') return !s.is_active
        return true
      })
      .filter(s => s.email.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime())
  }, [subscribers, filter, search])

  const activeEmails = subscribers.filter(s => s.is_active).map(s => s.email)

  const copyEmails = async () => {
    if (activeEmails.length === 0) return
    try {
      await navigator.clipboard.writeText(activeEmails.join(', '))
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = activeEmails.join(', ')
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopyStatus('success')
    setTimeout(() => setCopyStatus('idle'), 2000)
  }

  const exportCSV = () => {
    const rows = [['Email', 'Estado', 'Fecha'], ...activeEmails.map(e => [e, 'Activo', ''])]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `suscriptores-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const activeCount = subscribers.filter(s => s.is_active).length

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-display">Suscriptores</h1>
          <p className="mt-1 text-[14px] text-ink-mute">
            {subscribers.length} total · {activeCount} activos
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={copyEmails} className="btn-primary text-[13px]">
            {copyStatus === 'success' ? '✓ Copiados' : `Copiar emails (${activeCount})`}
          </button>
          <button onClick={exportCSV} className="btn-ghost text-[13px]">
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8">
        <input
          type="text"
          placeholder="Buscar…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-apple sm:max-w-xs"
        />
        <div className="flex gap-1 bg-canvas-alt rounded-2xl p-1">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-[13px] transition-colors ${
                filter === f ? 'bg-canvas-card shadow-apple-sm text-ink font-medium' : 'text-ink-mute hover:text-ink'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : 'Inactivos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="mt-6 card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-line-soft">
              <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider">Email</th>
              <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider">Estado</th>
              <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider hidden sm:table-cell">Fecha</th>
              <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-canvas-alt/50 transition-colors">
                <td className="px-5 py-3.5 text-[14px] text-ink">{s.email}</td>
                <td className="px-5 py-3.5">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded-full ${
                    s.is_active
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-red-50 text-red-600'
                  }`}>
                    {s.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-[13px] text-ink-mute hidden sm:table-cell">
                  {new Date(s.subscribed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </td>
                <td className="px-5 py-3.5 text-right space-x-2">
                  <button
                    onClick={() => updateStatus(s.id, !s.is_active)}
                    className="text-[12px] text-accent hover:underline"
                  >
                    {s.is_active ? 'Desactivar' : 'Reactivar'}
                  </button>
                  <button
                    onClick={() => deleteSubscriber(s.id)}
                    className="text-[12px] text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center py-12 text-[14px] text-ink-mute">
            No se encontraron suscriptores.
          </p>
        )}
      </div>
    </div>
  )
}
