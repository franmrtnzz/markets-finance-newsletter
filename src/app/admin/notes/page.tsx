'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Note { id: string; body: string; status: string; published_at: string | null; created_at: string }

export default function AdminNotes() {
  const [items, setItems] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { load() }, [])
  const load = async () => {
    const res = await fetch('/api/admin/notes')
    if (res.ok) { const d = await res.json(); setItems(d.notes || []) }
    setLoading(false)
  }

  const del = async (id: string) => {
    if (!confirm('¿Eliminar esta nota?')) return
    await fetch(`/api/admin/notes/${id}`, { method: 'DELETE' })
    load()
  }

  const toggleStatus = async (item: Note) => {
    const newStatus = item.status === 'published' ? 'draft' : 'published'
    await fetch(`/api/admin/notes/${item.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display">Notas</h1>
          <p className="mt-1 text-[14px] text-ink-mute">{items.length} notas</p>
        </div>
        <Link href="/admin/notes/new" className="btn-primary text-[13px]">+ Nueva nota</Link>
      </div>

      {items.length === 0 ? (
        <div className="card p-16 text-center mt-8">
          <p className="text-title">Aún no hay notas</p>
        </div>
      ) : (
        <ol className="mt-8 space-y-3">
          {items.map(n => (
            <li key={n.id} className="card p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] text-ink whitespace-pre-wrap line-clamp-4">{n.body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-block px-2 py-0.5 text-[11px] font-medium rounded-full ${
                      n.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {n.status === 'published' ? 'Publicada' : 'Borrador'}
                    </span>
                    <span className="text-[11px] text-ink-mute">
                      {new Date(n.published_at || n.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => toggleStatus(n)} className="text-[12px] text-accent hover:underline">
                    {n.status === 'published' ? 'Despublicar' : 'Publicar'}
                  </button>
                  <button onClick={() => del(n.id)} className="text-[12px] text-red-500 hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
