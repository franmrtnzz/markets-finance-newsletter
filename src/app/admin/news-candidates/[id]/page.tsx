'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { NewsCandidate, NewsCategory, NewsScope, NewsStatus } from '@/lib/types'

const CATEGORY_OPTIONS: { value: NewsCategory; label: string }[] = [
  { value: 'economia_general', label: 'Economía general' },
  { value: 'sector_financiero', label: 'Sector financiero' },
]

const SCOPE_OPTIONS: { value: NewsScope; label: string }[] = [
  { value: 'espana', label: 'España' },
  { value: 'europa', label: 'Europa' },
  { value: 'eeuu', label: 'EE. UU.' },
  { value: 'global', label: 'Global' },
  { value: 'otro', label: 'Otro' },
]

const STATUS_OPTIONS: { value: NewsStatus; label: string }[] = [
  { value: 'pendiente', label: 'Pendiente de revisar' },
  { value: 'candidata', label: 'Candidata fuerte' },
  { value: 'descartada', label: 'Descartada' },
  { value: 'seleccionada', label: 'Seleccionada' },
]

function getCurrentQuarter(): string {
  const now = new Date()
  const q = Math.ceil((now.getMonth() + 1) / 4)
  return `${now.getFullYear()}-C${q}`
}

export default function NewsCandidateEditor() {
  const router = useRouter()
  const params = useParams()
  const isNew = params?.id === 'new'

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!isNew)
  const [error, setError] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Campos del formulario
  const [title, setTitle] = useState('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')
  const [publishedDate, setPublishedDate] = useState('')
  const [category, setCategory] = useState<NewsCategory>('economia_general')
  const [scope, setScope] = useState<NewsScope>('global')
  const [quarter, setQuarter] = useState(getCurrentQuarter())
  const [tags, setTags] = useState<string[]>([])
  const [summary, setSummary] = useState('')
  const [relevance, setRelevance] = useState('')
  const [editorialIdea, setEditorialIdea] = useState('')
  const [importance, setImportance] = useState('')
  const [editorialAngle, setEditorialAngle] = useState('')
  const [inversusLink, setInversusLink] = useState('')
  const [rating, setRating] = useState(0)
  const [status, setStatus] = useState<NewsStatus>('pendiente')
  const [selectedFor, setSelectedFor] = useState<NewsCategory | ''>('')

  useEffect(() => {
    if (!isNew && params?.id) {
      loadItem(params.id as string)
    }
  }, [isNew, params?.id])

  const loadItem = async (id: string) => {
    const res = await fetch(`/api/admin/news-candidates/${id}`)
    if (res.ok) {
      const data: NewsCandidate = await res.json()
      setTitle(data.title)
      setSource(data.source || '')
      setUrl(data.url || '')
      setPublishedDate(data.published_date || '')
      setCategory(data.category)
      setScope(data.scope)
      setQuarter(data.quarter)
      setTags(data.tags)
      setSummary(data.summary || '')
      setRelevance(data.relevance || '')
      setEditorialIdea(data.editorial_idea || '')
      setImportance(data.importance || '')
      setEditorialAngle(data.editorial_angle || '')
      setInversusLink(data.inversus_link || '')
      setRating(data.rating)
      setStatus(data.status)
      setSelectedFor(data.selected_for || '')
    } else {
      setError('No se pudo cargar la noticia')
    }
    setLoading(false)
  }

  const save = async () => {
    if (!title.trim()) { setError('El título es requerido'); return }
    if (!quarter.trim()) { setError('El cuatrimestre es requerido'); return }

    setSaving(true)
    setError('')

    const payload = {
      title,
      source: source || null,
      url: url || null,
      published_date: publishedDate || null,
      category,
      scope,
      quarter,
      tags,
      summary: summary || null,
      relevance: relevance || null,
      editorial_idea: editorialIdea || null,
      importance: importance || null,
      editorial_angle: editorialAngle || null,
      inversus_link: inversusLink || null,
      rating,
      status,
      selected_for: selectedFor || null,
    }

    try {
      const endpoint = isNew
        ? '/api/admin/news-candidates'
        : `/api/admin/news-candidates/${params?.id}`
      const method = isNew ? 'POST' : 'PATCH'

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setError((await res.json()).error || 'Error al guardar')
      } else {
        router.push('/admin/news-candidates')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setSaving(false)
    }
  }

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="p-6 lg:p-10 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display">{isNew ? 'Nueva noticia candidata' : 'Editar noticia'}</h1>
          <p className="mt-1 text-[13px] text-ink-mute">
            {isNew ? 'Registra una noticia para evaluar su inclusión en la newsletter.' : 'Actualiza la información y evaluación.'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push('/admin/news-candidates')} className="btn-ghost text-[13px]">Cancelar</button>
          <button onClick={save} disabled={saving} className="btn-primary text-[13px]">
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>

      {error && <div className="mb-6 rounded-2xl px-4 py-3 text-[14px] bg-red-50 text-red-900 border border-red-200">{error}</div>}

      <div className="space-y-8">
        {/* Sección: Información básica */}
        <section>
          <h2 className="text-[13px] font-medium text-ink-mute uppercase tracking-wide mb-4">Información de la noticia</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Título *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título de la noticia"
                className="input-apple text-[14px]"
                autoFocus={isNew}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Fuente / Medio</label>
                <input
                  type="text"
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="El País, Financial Times…"
                  className="input-apple text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Enlace original</label>
                <input
                  type="url"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://…"
                  className="input-apple text-[14px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Fecha de publicación</label>
                <input
                  type="date"
                  value={publishedDate}
                  onChange={e => setPublishedDate(e.target.value)}
                  className="input-apple text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Cuatrimestre *</label>
                <input
                  type="text"
                  value={quarter}
                  onChange={e => setQuarter(e.target.value)}
                  placeholder="2026-C2"
                  className="input-apple text-[14px]"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Ámbito geográfico</label>
                <select
                  value={scope}
                  onChange={e => setScope(e.target.value as NewsScope)}
                  className="input-apple text-[14px]"
                >
                  {SCOPE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Sección: Clasificación */}
        <section>
          <h2 className="text-[13px] font-medium text-ink-mute uppercase tracking-wide mb-4">Clasificación</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Categoría principal</label>
              <div className="flex gap-3">
                {CATEGORY_OPTIONS.map(o => (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setCategory(o.value)}
                    className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all border ${
                      category === o.value
                        ? 'bg-ink text-white border-ink'
                        : 'bg-canvas-alt text-ink-soft border-line-soft hover:border-line'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Etiquetas</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                  placeholder="Escribe y pulsa Enter"
                  className="input-apple text-[14px] flex-1"
                />
                <button type="button" onClick={addTag} className="btn-ghost text-[13px] !px-4">Añadir</button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {tags.map(t => (
                    <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-canvas-alt text-[12px] text-ink-soft border border-line-soft">
                      {t}
                      <button onClick={() => removeTag(t)} className="text-ink-mute hover:text-red-500 ml-0.5">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Sección: Contenido editorial */}
        <section>
          <h2 className="text-[13px] font-medium text-ink-mute uppercase tracking-wide mb-4">Contenido editorial</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Breve resumen</label>
              <textarea
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="¿De qué trata la noticia?"
                className="input-apple text-[14px]"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">¿Por qué es relevante para la newsletter?</label>
              <textarea
                value={relevance}
                onChange={e => setRelevance(e.target.value)}
                placeholder="¿Qué la hace interesante para Inversus Group?"
                className="input-apple text-[14px]"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Ideas para comentario de Inversus Group</label>
              <textarea
                value={editorialIdea}
                onChange={e => setEditorialIdea(e.target.value)}
                placeholder="¿Qué podría comentar Inversus sobre esta noticia?"
                className="input-apple text-[14px]"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </section>

        {/* Sección: Preparación para la newsletter */}
        <section>
          <h2 className="text-[13px] font-medium text-ink-mute uppercase tracking-wide mb-4">Preparación newsletter</h2>
          <p className="text-[12px] text-ink-mute mb-4">Completa estos campos cuando la noticia sea candidata fuerte o seleccionada, para preparar el material de la newsletter.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Importancia / Por qué incluirla</label>
              <textarea
                value={importance}
                onChange={e => setImportance(e.target.value)}
                placeholder="¿Por qué esta noticia debería aparecer en la newsletter?"
                className="input-apple text-[14px]"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Enfoque editorial propuesto</label>
              <textarea
                value={editorialAngle}
                onChange={e => setEditorialAngle(e.target.value)}
                placeholder="¿Desde qué ángulo presentar la noticia?"
                className="input-apple text-[14px]"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Conexión con Inversus Group</label>
              <textarea
                value={inversusLink}
                onChange={e => setInversusLink(e.target.value)}
                placeholder="¿Cómo se conecta con la actividad, visión o posicionamiento de Inversus?"
                className="input-apple text-[14px]"
                rows={3}
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>
        </section>

        {/* Sección: Evaluación y estado */}
        <section>
          <h2 className="text-[13px] font-medium text-ink-mute uppercase tracking-wide mb-4">Evaluación</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium text-ink mb-1.5">Valoración (0-5)</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(rating === i ? 0 : i)}
                    className={`w-9 h-9 rounded-full text-[16px] transition-all border ${
                      i <= rating
                        ? 'bg-amber-50 border-amber-200 text-amber-500'
                        : 'bg-canvas-alt border-line-soft text-neutral-300 hover:text-amber-400'
                    }`}
                  >
                    ★
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-[12px] text-ink-mute self-center">{rating}/5</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-ink mb-1.5">Estado</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as NewsStatus)}
                  className="input-apple text-[14px]"
                >
                  {STATUS_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              {status === 'seleccionada' && (
                <div>
                  <label className="block text-[13px] font-medium text-ink mb-1.5">Seleccionada para</label>
                  <select
                    value={selectedFor}
                    onChange={e => setSelectedFor(e.target.value as NewsCategory | '')}
                    className="input-apple text-[14px]"
                  >
                    <option value="">Sin asignar</option>
                    {CATEGORY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer de acciones */}
      <div className="mt-10 pt-6 border-t border-line-soft flex justify-end gap-2">
        <button onClick={() => router.push('/admin/news-candidates')} className="btn-ghost text-[13px]">Cancelar</button>
        <button onClick={save} disabled={saving} className="btn-primary text-[13px]">
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
