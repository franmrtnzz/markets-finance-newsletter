'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Art { id: string; slug: string; title: string; status: string; published_at: string | null; created_at: string; tags: string[] }

export default function AdminArticles() {
  const [items, setItems] = useState<Art[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    const res = await fetch('/api/admin/articles')
    if (res.ok) { const d = await res.json(); setItems(d.articles || []) }
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar este artículo?')) return
    await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' })
    load()
  }

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display">Artículos</h1>
          <p className="mt-1 text-[14px] text-ink-mute">{items.length} artículos</p>
        </div>
        <Link href="/admin/articles/new" className="btn-primary text-[13px]">+ Nuevo artículo</Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-16 text-center mt-8">
          <p className="text-title">Aún no hay artículos</p>
          <p className="mt-2 text-[14px] text-ink-soft">Sube el primero.</p>
        </div>
      ) : (
        <div className="mt-8 card overflow-hidden">
          <table className="w-full text-left">
            <thead><tr className="border-b border-line-soft">
              <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider">Título</th>
              <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider hidden sm:table-cell">Estado</th>
              <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider text-right">Acciones</th>
            </tr></thead>
            <tbody className="divide-y divide-line-soft">
              {items.map(a => (
                <tr key={a.id} className="hover:bg-canvas-alt/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/articles/${a.id}`} className="text-[14px] font-medium text-ink hover:text-accent transition-colors">{a.title}</Link>
                    {a.tags?.length > 0 && <p className="text-[11px] text-ink-mute mt-0.5">{a.tags.join(', ')}</p>}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded-full ${a.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {a.status === 'published' ? 'Publicado' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => del(a.id)} className="text-[12px] text-red-500 hover:underline">Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
