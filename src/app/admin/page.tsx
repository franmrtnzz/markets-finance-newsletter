'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'

interface Subscriber {
  id: string
  email: string
  is_active: boolean
  subscribed_at: string
}

function calculateGrowthMetrics(subscribers: Subscriber[]) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

  const thisWeek = subscribers.filter(s => new Date(s.subscribed_at) >= startOfWeek).length
  const thisMonth = subscribers.filter(s => new Date(s.subscribed_at) >= startOfMonth).length
  const lastMonth = subscribers.filter(s => {
    const date = new Date(s.subscribed_at)
    return date >= startOfLastMonth && date <= endOfLastMonth
  }).length

  return { thisWeek, thisMonth, lastMonth }
}

export default function AdminDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchSubscribers()
    const clockInterval = setInterval(() => setCurrentTime(new Date()), 1000)
    const dataInterval = setInterval(() => fetchSubscribers(false), 30000)
    return () => { clearInterval(clockInterval); clearInterval(dataInterval) }
  }, [])

  const fetchSubscribers = async (showLoading = true) => {
    if (showLoading) setLoading(true)
    try {
      const response = await fetch('/api/admin/subscribers')
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubscribers(false)
    setRefreshing(false)
  }

  const stats = useMemo(() => {
    const active = subscribers.filter(s => s.is_active).length
    const inactive = subscribers.filter(s => !s.is_active).length
    const growth = calculateGrowthMetrics(subscribers)
    const recentSubscribers = [...subscribers]
      .sort((a, b) => new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime())
      .slice(0, 5)
    return { subscribers: { total: subscribers.length, active, inactive }, growth, recentSubscribers }
  }, [subscribers])

  const retentionRate = stats.subscribers.total > 0 
    ? ((stats.subscribers.active / stats.subscribers.total) * 100).toFixed(1) : '0.0'

  const monthlyGrowthRate = stats.growth.lastMonth > 0
    ? (((stats.growth.thisMonth - stats.growth.lastMonth) / stats.growth.lastMonth) * 100).toFixed(1)
    : stats.growth.thisMonth > 0 ? '+100' : '0'

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 font-medium">Cargando dashboard...</p>
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
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Markets & Finance</h1>
                <p className="text-sm text-slate-400">Subscriber Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-2xl font-mono text-white tracking-wider">
                  {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">
                  {currentTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <button onClick={handleRefresh} disabled={refreshing}
                className="group bg-slate-800 hover:bg-slate-700 text-white px-4 py-2.5 rounded-xl border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 flex items-center space-x-2 disabled:opacity-50">
                <svg className={`w-4 h-4 text-emerald-400 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="text-sm font-medium">{refreshing ? 'Actualizando...' : 'Actualizar'}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-full">TOTAL</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.subscribers.total}</p>
            <p className="text-sm text-slate-400">Suscriptores totales</p>
          </div>

          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">ACTIVOS</span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.subscribers.active}</p>
            <p className="text-sm text-slate-400">Reciben la newsletter</p>
          </div>

          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">RETENCIÓN</span>
            </div>
            <p className="text-4xl font-bold text-white">{retentionRate}%</p>
            <p className="text-sm text-slate-400">Tasa de retención</p>
            <div className="mt-4 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${retentionRate}%` }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${Number(monthlyGrowthRate) >= 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                {Number(monthlyGrowthRate) >= 0 ? '+' : ''}{monthlyGrowthRate}%
              </span>
            </div>
            <p className="text-4xl font-bold text-white">{stats.growth.thisMonth}</p>
            <p className="text-sm text-slate-400">Nuevos este mes</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Crecimiento</h3>
              <span className="text-xs text-slate-500 uppercase">Últimos periodos</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center space-x-3"><div className="w-2 h-2 bg-emerald-400 rounded-full"></div><span className="text-sm text-slate-300">Esta semana</span></div>
                <span className="text-lg font-bold text-white">{stats.growth.thisWeek}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center space-x-3"><div className="w-2 h-2 bg-blue-400 rounded-full"></div><span className="text-sm text-slate-300">Este mes</span></div>
                <span className="text-lg font-bold text-white">{stats.growth.thisMonth}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                <div className="flex items-center space-x-3"><div className="w-2 h-2 bg-slate-500 rounded-full"></div><span className="text-sm text-slate-300">Mes anterior</span></div>
                <span className="text-lg font-bold text-white">{stats.growth.lastMonth}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Estado de Audiencia</h3>
              <span className="text-xs text-slate-500 uppercase">Distribución</span>
            </div>
            <div className="flex items-center justify-center mb-6">
              <div className="relative w-32 h-32">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="12" className="text-slate-700" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="url(#gradient)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${Number(retentionRate) * 2.51} 251`} />
                  <defs><linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#10b981" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{retentionRate}%</span>
                  <span className="text-xs text-slate-400">activos</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center space-x-6 text-sm">
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-emerald-500 rounded-full"></div><span className="text-slate-400">Activos: {stats.subscribers.active}</span></div>
              <div className="flex items-center space-x-2"><div className="w-3 h-3 bg-slate-600 rounded-full"></div><span className="text-slate-400">Inactivos: {stats.subscribers.inactive}</span></div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Últimos Suscriptores</h3>
              <Link href="/admin/subscribers" className="text-xs text-emerald-400 hover:text-emerald-300">Ver todos →</Link>
            </div>
            <div className="space-y-3">
              {stats.recentSubscribers.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No hay suscriptores aún</p>
              ) : (
                stats.recentSubscribers.map((subscriber) => (
                  <div key={subscriber.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${subscriber.is_active ? 'bg-emerald-400' : 'bg-slate-500'}`}></div>
                      <span className="text-sm text-slate-300 truncate">{subscriber.email}</span>
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0 ml-2">{new Date(subscriber.subscribed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/admin/subscribers" className="group bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-2xl p-8 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Gestionar Suscriptores</h3>
                <p className="text-emerald-100/80">Ver lista completa, exportar CSV, copiar emails</p>
              </div>
              <svg className="w-8 h-8 text-white/80 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl p-8 border border-slate-700/50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">Resumen Rápido</h3>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-emerald-400"><span className="font-bold">{stats.subscribers.active}</span> activos</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-blue-400"><span className="font-bold">{stats.growth.thisWeek}</span> esta semana</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-purple-400"><span className="font-bold">{retentionRate}%</span> retención</span>
                </div>
              </div>
              <div className="p-4 bg-slate-700/50 rounded-xl">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>Markets & Finance Newsletter © {new Date().getFullYear()}</p>
            <p>Actualización automática cada 30 segundos</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
