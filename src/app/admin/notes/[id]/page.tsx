'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function NoteEditor() {
  const router = useRouter()
  const params = useParams()
  const isNew = params?.id === 'new'

  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const save = async (status: 'draft' | 'published') => {
    if (!body.trim()) { setError('Escribe algo'); return }
    setSaving(true); setError('')
    try {
      const res = await fetch('/api/admin/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: body.trim(), status }),
      })
      if (!res.ok) { setError((await res.json()).error || 'Error') }
      else { router.push('/admin/notes') }
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display">Nueva nota</h1>
        <div className="flex gap-2">
          <button onClick={() => save('draft')} disabled={saving} className="btn-ghost text-[13px]">Borrador</button>
          <button onClick={() => save('published')} disabled={saving} className="btn-primary text-[13px]">Publicar</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-2xl px-4 py-3 text-[14px] bg-red-50 text-red-900 border border-red-200">{error}</div>}

      <textarea
        value={body}
        onChange={e => setBody(e.target.value)}
        placeholder="Escribe tu nota… Puede ser una idea, un enlace interesante, un comentario tipo LinkedIn…"
        className="input-apple text-[15px] leading-relaxed"
        rows={10}
        autoFocus
        style={{ resize: 'vertical' }}
      />
      <p className="mt-2 text-right text-[12px] text-ink-mute">{body.length} caracteres</p>
    </div>
  )
}
