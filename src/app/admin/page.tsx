'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ subscribers: 0, active: 0, newsletters: 0, articles: 0, notes: 0 })
  const [recentSubs, setRecentSubs] = useState<{ email: string; subscribed_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [subRes, nlRes, artRes, noteRes] = await Promise.all([
          fetch('/api/admin/subscribers'),
          fetch('/api/admin/newsletters'),
          fetch('/api/admin/articles'),
          fetch('/api/admin/notes'),
        ])
        const subData = subRes.ok ? await subRes.json() : { subscribers: [] }
        const nlData = nlRes.ok ? await nlRes.json() : { newsletters: [] }
        const artData = artRes.ok ? await artRes.json() : { articles: [] }
        const noteData = noteRes.ok ? await noteRes.json() : { notes: [] }

        const subs = subData.subscribers || []
        setStats({
          subscribers: subs.length,
          active: subs.filter((s: { is_active: boolean }) => s.is_active).length,
          newsletters: nlData.newsletters?.length || 0,
          articles: artData.articles?.length || 0,
          notes: noteData.notes?.length || 0,
        })
        setRecentSubs(
          subs
            .sort((a: { subscribed_at: string }, b: { subscribed_at: string }) =>
              new Date(b.subscribed_at).getTime() - new Date(a.subscribed_at).getTime()
            )
            .slice(0, 5)
        )
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const cards = [
    { label: 'Suscriptores activos', value: stats.active, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total suscriptores', value: stats.subscribers, accent: 'text-ink', bg: 'bg-canvas-alt' },
    { label: 'Newsletters', value: stats.newsletters, accent: 'text-accent', bg: 'bg-blue-50' },
    { label: 'Artículos', value: stats.articles, accent: 'text-violet-600', bg: 'bg-violet-50' },
    { label: 'Notas', value: stats.notes, accent: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const quickActions = [
    { label: 'Nueva newsletter', href: '/admin/newsletters/new', icon: '✉️' },
    { label: 'Nuevo artículo', href: '/admin/articles/new', icon: '📄' },
    { label: 'Nueva nota', href: '/admin/notes/new', icon: '💬' },
    { label: 'Copiar emails', href: '/admin/subscribers', icon: '📋' },
  ]

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <h1 className="text-display">Dashboard</h1>
      <p className="mt-1 text-[15px] text-ink-soft">Resumen de tu plataforma.</p>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">
        {cards.map(c => (
          <div key={c.label} className={`rounded-2xl p-5 ${c.bg}`}>
            <p className={`text-3xl font-semibold tracking-tight ${c.accent}`}>{c.value}</p>
            <p className="mt-1 text-[12px] text-ink-mute">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 className="mt-12 text-title">Acciones rápidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        {quickActions.map(a => (
          <Link
            key={a.href}
            href={a.href}
            className="card card-hover p-5 text-center"
          >
            <span className="text-2xl">{a.icon}</span>
            <p className="mt-2 text-[14px] font-medium text-ink">{a.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent subscribers */}
      <h2 className="mt-12 text-title">Últimos suscriptores</h2>
      {recentSubs.length === 0 ? (
        <p className="mt-3 text-[14px] text-ink-mute">No hay suscriptores aún.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line-soft border border-line-soft rounded-2xl overflow-hidden bg-canvas-card">
          {recentSubs.map((s, i) => (
            <li key={i} className="flex items-center justify-between px-5 py-3">
              <span className="text-[14px] text-ink">{s.email}</span>
              <span className="text-[12px] text-ink-mute">
                {new Date(s.subscribed_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
