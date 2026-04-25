'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface NL { id: string; slug: string; title: string; status: string; published_at: string | null; created_at: string }

export default function AdminNewsletters() {
  const [items, setItems] = useState<NL[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    const res = await fetch('/api/admin/newsletters')
    if (res.ok) { const d = await res.json(); setItems(d.newsletters || []) }
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar esta newsletter?')) return
    await fetch(`/api/admin/newsletters/${id}`, { method: 'DELETE' })
    load()
  }

  const toggleStatus = async (item: NL) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    await fetch(`/api/admin/newsletters/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-6 lg:p-10 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display">Newsletters</h1>
          <p className="mt-1 text-[14px] text-ink-mute">{items.length} ediciones</p>
        </div>
        <Link href="/admin/newsletters/new" className="btn-primary text-[13px]">
          + Nueva newsletter
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-16 text-center mt-8">
          <p className="text-title">Aún no hay newsletters</p>
          <p className="mt-2 text-[14px] text-ink-soft">Crea la primera pulsando el botón de arriba.</p>
        </div>
      ) : (
        <div className="mt-8 card overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line-soft">
                <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider">Título</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider hidden sm:table-cell">Estado</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider hidden sm:table-cell">Fecha</th>
                <th className="px-5 py-3 text-[12px] font-medium text-ink-mute uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {items.map(n => (
                <tr key={n.id} className="hover:bg-canvas-alt/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/newsletters/${n.id}`} className="text-[14px] font-medium text-ink hover:text-accent transition-colors">
                      {n.title}
                    </Link>
                    <p className="text-[12px] text-ink-mute mt-0.5">/{n.slug}</p>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className={`inline-block px-2.5 py-1 text-[11px] font-medium rounded-full ${
                      n.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {n.status === 'published' ? 'Publicada' : 'Borrador'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-ink-mute hidden sm:table-cell">
                    {new Date(n.published_at || n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-3">
                    <button onClick={() => toggleStatus(n)} className="text-[12px] text-accent hover:underline">
                      {n.status === 'published' ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button onClick={() => del(n.id)} className="text-[12px] text-red-500 hover:underline">
                      Eliminar
                    </button>
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
