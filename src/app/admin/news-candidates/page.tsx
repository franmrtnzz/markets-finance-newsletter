'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { NewsCandidate, NewsCategory, NewsScope, NewsStatus } from '@/lib/types'

const CATEGORY_LABELS: Record<NewsCategory, string> = {
  economia_general: 'Economía general',
  sector_financiero: 'Sector financiero',
}

const SCOPE_LABELS: Record<NewsScope, string> = {
  espana: 'España',
  europa: 'Europa',
  eeuu: 'EE. UU.',
  global: 'Global',
  otro: 'Otro',
}

const STATUS_LABELS: Record<NewsStatus, string> = {
  pendiente: 'Pendiente',
  candidata: 'Candidata',
  descartada: 'Descartada',
  seleccionada: 'Seleccionada',
}

const STATUS_STYLES: Record<NewsStatus, string> = {
  pendiente: 'bg-amber-50 text-amber-700',
  candidata: 'bg-blue-50 text-blue-700',
  descartada: 'bg-neutral-100 text-neutral-500',
  seleccionada: 'bg-emerald-50 text-emerald-700',
}

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 4)
  return `${now.getFullYear()}-C${q}`
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`text-[12px] ${i <= rating ? 'text-amber-500' : 'text-neutral-200'}`}>★</span>
      ))}
    </span>
  )
}

export default function AdminNewsCandidates() {
  const [items, setItems] = useState<NewsCandidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Filtros
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterQuarter, setFilterQuarter] = useState<string>('')
  const [filterScope, setFilterScope] = useState<string>('')
  const [filterTag, setFilterTag] = useState<string>('')

  useEffect(() => { load() }, [])

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/news-candidates')
    if (res.ok) {
      const d = await res.json()
      setItems(d.news || [])
    }
    setLoading(false)
  }

  // Obtener cuatrimestres y tags únicos de los datos
  const quarters = useMemo(() => Array.from(new Set(items.map(n => n.quarter))).sort().reverse(), [items])
  const allTags = useMemo(() => Array.from(new Set(items.flatMap(n => n.tags))).sort(), [items])

  // Filtrado local para evitar múltiples requests
  const filtered = useMemo(() => {
    return items.filter(n => {
      if (filterCategory && n.category !== filterCategory) return false
      if (filterStatus && n.status !== filterStatus) return false
      if (filterQuarter && n.quarter !== filterQuarter) return false
      if (filterScope && n.scope !== filterScope) return false
      if (filterTag && !n.tags.includes(filterTag)) return false
      if (search) {
        const s = search.toLowerCase()
        const matches = n.title.toLowerCase().includes(s) ||
          n.source?.toLowerCase().includes(s) ||
          n.summary?.toLowerCase().includes(s) ||
          n.tags.some(t => t.toLowerCase().includes(s))
        if (!matches) return false
      }
      return true
    })
  }, [items, filterCategory, filterStatus, filterQuarter, filterScope, filterTag, search])

  // Estadísticas rápidas
  const stats = useMemo(() => ({
    total: items.length,
    pendientes: items.filter(n => n.status === 'pendiente').length,
    candidatas: items.filter(n => n.status === 'candidata').length,
    seleccionadas: items.filter(n => n.status === 'seleccionada').length,
  }), [items])

  const del = async (id: string) => {
    if (!confirm('¿Eliminar esta noticia candidata?')) return
    await fetch(`/api/admin/news-candidates/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 lg:p-10 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display">Noticias candidatas</h1>
          <p className="mt-1 text-[14px] text-ink-mute">Repositorio de noticias para la newsletter cuatrimestral</p>
        </div>
        <Link href="/admin/news-candidates/new" className="btn-primary text-[13px]">+ Nueva noticia</Link>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        <div className="rounded-2xl p-4 bg-canvas-alt">
          <p className="text-2xl font-semibold tracking-tight text-ink">{stats.total}</p>
          <p className="text-[11px] text-ink-mute">Total</p>
        </div>
        <div className="rounded-2xl p-4 bg-amber-50">
          <p className="text-2xl font-semibold tracking-tight text-amber-600">{stats.pendientes}</p>
          <p className="text-[11px] text-ink-mute">Pendientes</p>
        </div>
        <div className="rounded-2xl p-4 bg-blue-50">
          <p className="text-2xl font-semibold tracking-tight text-blue-600">{stats.candidatas}</p>
          <p className="text-[11px] text-ink-mute">Candidatas</p>
        </div>
        <div className="rounded-2xl p-4 bg-emerald-50">
          <p className="text-2xl font-semibold tracking-tight text-emerald-600">{stats.seleccionadas}</p>
          <p className="text-[11px] text-ink-mute">Seleccionadas</p>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="mt-6 space-y-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por título, fuente, resumen o etiqueta…"
          className="input-apple text-[14px]"
        />
        <div className="flex flex-wrap gap-2">
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="input-apple text-[13px] !w-auto !py-2 !px-3"
          >
            <option value="">Todas las categorías</option>
            {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="input-apple text-[13px] !w-auto !py-2 !px-3"
          >
            <option value="">Todos los estados</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={filterQuarter}
            onChange={e => setFilterQuarter(e.target.value)}
            className="input-apple text-[13px] !w-auto !py-2 !px-3"
          >
            <option value="">Todos los cuatrimestres</option>
            {quarters.map(q => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
          <select
            value={filterScope}
            onChange={e => setFilterScope(e.target.value)}
            className="input-apple text-[13px] !w-auto !py-2 !px-3"
          >
            <option value="">Todos los ámbitos</option>
            {Object.entries(SCOPE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {allTags.length > 0 && (
            <select
              value={filterTag}
              onChange={e => setFilterTag(e.target.value)}
              className="input-apple text-[13px] !w-auto !py-2 !px-3"
            >
              <option value="">Todas las etiquetas</option>
              {allTags.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          )}
          {(filterCategory || filterStatus || filterQuarter || filterScope || filterTag || search) && (
            <button
              onClick={() => { setFilterCategory(''); setFilterStatus(''); setFilterQuarter(''); setFilterScope(''); setFilterTag(''); setSearch('') }}
              className="text-[12px] text-accent hover:underline py-2 px-2"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Resultados */}
      <p className="mt-4 text-[12px] text-ink-mute">
        {filtered.length} {filtered.length === 1 ? 'noticia' : 'noticias'} encontradas
      </p>

      {filtered.length === 0 ? (
        <div className="card p-16 text-center mt-4">
          <p className="text-title">
            {items.length === 0 ? 'Aún no hay noticias guardadas' : 'No hay noticias con estos filtros'}
          </p>
          {items.length === 0 && (
            <p className="mt-2 text-[14px] text-ink-mute">Empieza añadiendo noticias candidatas para la próxima newsletter.</p>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map(n => (
            <div key={n.id} className="card p-5 hover:border-line transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${STATUS_STYLES[n.status]}`}>
                      {STATUS_LABELS[n.status]}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-canvas-alt text-ink-soft">
                      {CATEGORY_LABELS[n.category]}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-canvas-alt text-ink-soft">
                      {SCOPE_LABELS[n.scope]}
                    </span>
                    {n.selected_for && (
                      <span className="inline-block px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-100 text-emerald-800">
                        ✓ Seleccionada: {CATEGORY_LABELS[n.selected_for]}
                      </span>
                    )}
                  </div>
                  <Link href={`/admin/news-candidates/${n.id}`} className="block mt-2 group">
                    <h3 className="text-[15px] font-medium text-ink group-hover:text-accent transition-colors">{n.title}</h3>
                  </Link>
                  {n.summary && (
                    <p className="mt-1 text-[13px] text-ink-soft line-clamp-2">{n.summary}</p>
                  )}
                  <div className="mt-2 flex items-center gap-3 flex-wrap">
                    {n.source && (
                      <span className="text-[12px] text-ink-mute">{n.source}</span>
                    )}
                    {n.published_date && (
                      <span className="text-[12px] text-ink-mute">
                        {new Date(n.published_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                    <RatingStars rating={n.rating} />
                    {n.tags.length > 0 && (
                      <span className="text-[11px] text-ink-mute">
                        {n.tags.slice(0, 3).join(', ')}{n.tags.length > 3 ? ` +${n.tags.length - 3}` : ''}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link href={`/admin/news-candidates/${n.id}`} className="text-[12px] text-accent hover:underline">
                    Editar
                  </Link>
                  <button onClick={() => del(n.id)} className="text-[12px] text-red-500 hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
