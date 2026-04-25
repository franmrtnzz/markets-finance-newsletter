'use client'

import { useEffect, useRef, useState } from 'react'

export default function TemplatePage() {
  const [html, setHtml] = useState('')
  const [saved, setSaved] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Cargar HTML guardado
  useEffect(() => {
    fetch('/api/admin/template')
      .then(r => r.json())
      .then(d => {
        setHtml(d.html || '')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  // Actualizar preview
  useEffect(() => {
    if (!iframeRef.current) return
    const doc = iframeRef.current.contentDocument
    if (!doc) return
    doc.open()
    doc.write(html)
    doc.close()
  }, [html])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/template', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      })
      if (res.ok) setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-semibold text-ink tracking-tight">Formato actual</h1>
          <p className="text-[14px] text-ink-soft mt-1">
            Pega aquí el HTML de tu newsletter para tener siempre el formato de referencia.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || saved}
          className="btn-primary text-[14px] disabled:opacity-50"
        >
          {saving ? 'Guardando…' : saved ? 'Guardado ✓' : 'Guardar'}
        </button>
      </div>

      {/* Editor + Preview side by side */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-5 min-h-0">
        {/* Textarea */}
        <div className="flex flex-col min-h-0">
          <label className="text-[12px] font-medium text-ink-mute uppercase tracking-wider mb-2">
            HTML
          </label>
          <textarea
            value={html}
            onChange={e => { setHtml(e.target.value); setSaved(false) }}
            placeholder="Pega aquí el HTML de tu newsletter…"
            spellCheck={false}
            className="input-apple flex-1 font-mono text-[13px] leading-relaxed resize-none min-h-[400px]"
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col min-h-0">
          <label className="text-[12px] font-medium text-ink-mute uppercase tracking-wider mb-2">
            Vista previa
          </label>
          <div className="flex-1 border border-line rounded-2xl overflow-hidden bg-white min-h-[400px]">
            <iframe
              ref={iframeRef}
              title="Preview del formato"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
