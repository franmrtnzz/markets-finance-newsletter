'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function NewsletterEditor() {
  const router = useRouter()
  const params = useParams()
  const isNew = params?.id === 'new'
  const editId = isNew ? null : (params?.id as string)

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [html, setHtml] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/newsletters/${editId}`)
        .then(r => r.json())
        .then(d => {
          setSlug(d.slug || '')
          setTitle(d.title || '')
          setExcerpt(d.excerpt || '')
          setHtml(d.html || '')
        })
    }
  }, [editId])

  const autoSlug = (t: string) => {
    return t
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const save = async (status: 'draft' | 'published') => {
    if (!title.trim() || !html.trim()) {
      setError('Título y HTML son requeridos')
      return
    }
    const finalSlug = slug.trim() || autoSlug(title)
    setSaving(true)
    setError('')
    setSuccess('')

    const body = { slug: finalSlug, title: title.trim(), excerpt: excerpt.trim() || null, html, status }

    try {
      const url = editId ? `/api/admin/newsletters/${editId}` : '/api/admin/newsletters'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const d = await res.json()
        setError(d.error || 'Error al guardar')
      } else {
        setSuccess(status === 'published' ? 'Publicada ✓' : 'Guardada como borrador ✓')
        if (isNew) {
          const d = await res.json()
          setTimeout(() => router.push(`/admin/newsletters/${d.id}`), 800)
        }
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-10 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display">{isNew ? 'Nueva newsletter' : 'Editar newsletter'}</h1>
          <p className="mt-1 text-[14px] text-ink-mute">Pega el HTML que te da ChatGPT y previsualiza al instante.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => save('draft')} disabled={saving} className="btn-ghost text-[13px]">
            {saving ? 'Guardando…' : 'Guardar borrador'}
          </button>
          <button onClick={() => save('published')} disabled={saving} className="btn-primary text-[13px]">
            {saving ? 'Publicando…' : 'Publicar'}
          </button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-2xl px-4 py-3 text-[14px] bg-red-50 text-red-900 border border-red-200">{error}</div>}
      {success && <div className="mb-4 rounded-2xl px-4 py-3 text-[14px] bg-emerald-50 text-emerald-900 border border-emerald-200">{success}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Título</label>
          <input
            value={title}
            onChange={e => { setTitle(e.target.value); if (isNew && !slug) setSlug(autoSlug(e.target.value)) }}
            placeholder="Edición #1 — Semana del 21 de abril"
            className="input-apple"
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Slug (URL)</label>
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="edicion-1-semana-21-abril"
            className="input-apple"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Extracto (opcional, se muestra en el listado)</label>
        <input
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Resumen breve de esta edición…"
          className="input-apple"
        />
      </div>

      {/* Editor + Preview lado a lado */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">HTML</label>
          <textarea
            value={html}
            onChange={e => setHtml(e.target.value)}
            placeholder="Pega aquí el HTML de la newsletter…"
            className="input-apple font-mono text-[13px] leading-relaxed"
            rows={30}
            style={{ resize: 'vertical' }}
          />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Vista previa</label>
          <div className="card overflow-hidden h-[calc(30*1.625rem+1.5rem)] bg-white">
            <iframe
              srcDoc={html || '<p style="color:#999;padding:2rem;font-family:system-ui">La vista previa aparecerá aquí al pegar HTML…</p>'}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
