'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ArticleEditor() {
  const router = useRouter()
  const params = useParams()
  const isNew = params?.id === 'new'
  const editId = isNew ? null : (params?.id as string)

  const [slug, setSlug] = useState('')
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [description, setDescription] = useState('')
  const [pdfUrl, setPdfUrl] = useState('')
  const [pdfPath, setPdfPath] = useState('')
  const [coverUrl, setCoverUrl] = useState('')
  const [tags, setTags] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadingCover, setUploadingCover] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const coverRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editId) {
      fetch(`/api/admin/articles/${editId}`)
        .then(r => r.json())
        .then(d => {
          setSlug(d.slug || '')
          setTitle(d.title || '')
          setExcerpt(d.excerpt || '')
          setDescription(d.description || '')
          setPdfUrl(d.pdf_url || '')
          setPdfPath(d.pdf_path || '')
          setCoverUrl(d.cover_url || '')
          setTags((d.tags || []).join(', '))
        })
    }
  }, [editId])

  const autoSlug = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const uploadPDF = async (file: File) => {
    setUploading(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', 'pdf')
    try {
      const res = await fetch('/api/admin/articles/upload', { method: 'POST', body: fd })
      if (!res.ok) { setError('Error subiendo PDF'); return }
      const d = await res.json()
      setPdfUrl(d.pdf_url)
      setPdfPath(d.pdf_path)
    } catch {
      setError('Error de conexión')
    } finally {
      setUploading(false)
    }
  }

  const uploadCover = async (file: File) => {
    setUploadingCover(true)
    setError('')
    const fd = new FormData()
    fd.append('file', file)
    fd.append('kind', 'cover')
    try {
      const res = await fetch('/api/admin/articles/upload', { method: 'POST', body: fd })
      if (!res.ok) { setError('Error subiendo imagen'); return }
      const d = await res.json()
      setCoverUrl(d.cover_url)
    } catch {
      setError('Error de conexión')
    } finally {
      setUploadingCover(false)
    }
  }

  const save = async (status: 'draft' | 'published') => {
    if (!title.trim()) { setError('El título es requerido'); return }
    const finalSlug = slug.trim() || autoSlug(title)
    setSaving(true); setError(''); setSuccess('')

    const body = {
      slug: finalSlug,
      title: title.trim(),
      excerpt: excerpt.trim() || null,
      description: description.trim() || null,
      pdf_url: pdfUrl || null,
      pdf_path: pdfPath || null,
      cover_url: coverUrl || null,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      status,
    }

    try {
      const url = editId ? `/api/admin/articles/${editId}` : '/api/admin/articles'
      const method = editId ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { setError((await res.json()).error || 'Error al guardar') }
      else {
        setSuccess(status === 'published' ? 'Publicado ✓' : 'Guardado ✓')
        if (isNew) { const d = await res.json(); setTimeout(() => router.push(`/admin/articles/${d.id}`), 800) }
      }
    } catch { setError('Error de conexión') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-display">{isNew ? 'Nuevo artículo' : 'Editar artículo'}</h1>
        <div className="flex gap-2">
          <button onClick={() => save('draft')} disabled={saving} className="btn-ghost text-[13px]">Borrador</button>
          <button onClick={() => save('published')} disabled={saving} className="btn-primary text-[13px]">Publicar</button>
        </div>
      </div>

      {error && <div className="mb-4 rounded-2xl px-4 py-3 text-[14px] bg-red-50 text-red-900 border border-red-200">{error}</div>}
      {success && <div className="mb-4 rounded-2xl px-4 py-3 text-[14px] bg-emerald-50 text-emerald-900 border border-emerald-200">{success}</div>}

      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Título</label>
            <input value={title} onChange={e => { setTitle(e.target.value); if (isNew && !slug) setSlug(autoSlug(e.target.value)) }} className="input-apple" placeholder="Mi análisis de…" />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Slug</label>
            <input value={slug} onChange={e => setSlug(e.target.value)} className="input-apple" placeholder="mi-analisis" />
          </div>
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Extracto</label>
          <input value={excerpt} onChange={e => setExcerpt(e.target.value)} className="input-apple" placeholder="Resumen corto…" />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Tags (separados por coma)</label>
          <input value={tags} onChange={e => setTags(e.target.value)} className="input-apple" placeholder="macroeconomía, mercados, fed" />
        </div>

        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Descripción / texto que acompaña al PDF</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-apple" rows={6} placeholder="Texto complementario…" style={{ resize: 'vertical' }} />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">Imagen de portada (vista previa)</label>
          {coverUrl ? (
            <div className="card p-3 flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverUrl} alt="Portada" className="w-32 h-20 object-cover rounded-xl" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] text-ink-soft truncate">{coverUrl.split('/').pop()}</p>
              </div>
              <button onClick={() => setCoverUrl('')} className="text-[12px] text-red-500 hover:underline shrink-0">
                Quitar
              </button>
            </div>
          ) : (
            <div
              onClick={() => coverRef.current?.click()}
              className="card border-dashed border-2 border-line p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
            >
              <input ref={coverRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadCover(e.target.files[0]) }} />
              {uploadingCover ? (
                <div className="flex items-center justify-center gap-2 text-[14px] text-ink-mute">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Subiendo…
                </div>
              ) : (
                <>
                  <p className="text-[14px] text-ink-soft">Haz clic para subir una imagen</p>
                  <p className="text-[12px] text-ink-mute mt-1">JPG, PNG o WebP · se mostrará en la lista de artículos</p>
                </>
              )}
            </div>
          )}
        </div>

        {/* PDF Upload */}
        <div>
          <label className="block text-[13px] font-medium text-ink-mute mb-1.5">PDF</label>
          {pdfUrl ? (
            <div className="card p-4 flex items-center justify-between">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="text-[14px] text-accent hover:underline truncate">
                {pdfUrl.split('/').pop()}
              </a>
              <button onClick={() => { setPdfUrl(''); setPdfPath('') }} className="text-[12px] text-red-500 hover:underline ml-4 shrink-0">
                Quitar
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileRef.current?.click()}
              className="card border-dashed border-2 border-line p-10 text-center cursor-pointer hover:border-accent/50 transition-colors"
            >
              <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadPDF(e.target.files[0]) }} />
              {uploading ? (
                <div className="flex items-center justify-center gap-2 text-[14px] text-ink-mute">
                  <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Subiendo…
                </div>
              ) : (
                <>
                  <p className="text-[14px] text-ink-soft">Haz clic para subir un PDF</p>
                  <p className="text-[12px] text-ink-mute mt-1">o arrastra aquí</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
