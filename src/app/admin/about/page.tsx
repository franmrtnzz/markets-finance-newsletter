'use client'

import { useEffect, useState } from 'react'

interface Fact {
  emoji: string
  label: string
  value: string
}

interface AboutData {
  greeting: string
  photo: string
  bio: string
  facts: Fact[]
}

const emptyFact: Fact = { emoji: '', label: '', value: '' }

export default function AdminAboutPage() {
  const [data, setData] = useState<AboutData>({
    greeting: 'Hola, soy Fran 👋',
    photo: '/images/fran.jpg',
    bio: '',
    facts: [],
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/about')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const update = (patch: Partial<AboutData>) => {
    setData(prev => ({ ...prev, ...patch }))
    setSaved(false)
  }

  const updateFact = (i: number, patch: Partial<Fact>) => {
    const facts = [...data.facts]
    facts[i] = { ...facts[i], ...patch }
    update({ facts })
  }

  const removeFact = (i: number) => {
    update({ facts: data.facts.filter((_, idx) => idx !== i) })
  }

  const addFact = () => {
    update({ facts: [...data.facts, { ...emptyFact }] })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
    <div className="p-6 lg:p-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[22px] font-semibold text-ink tracking-tight">Sobre mí</h1>
          <p className="text-[14px] text-ink-soft mt-1">
            Edita el contenido de tu página pública &ldquo;Sobre mí&rdquo;.
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

      <div className="space-y-8">
        {/* Título / Saludo */}
        <div>
          <label className="text-[12px] font-medium text-ink-mute uppercase tracking-wider">
            Título / Saludo
          </label>
          <input
            type="text"
            value={data.greeting}
            onChange={e => update({ greeting: e.target.value })}
            className="input-apple mt-2 w-full"
            placeholder="Hola, soy Fran 👋"
          />
        </div>

        {/* Ruta de la foto */}
        <div>
          <label className="text-[12px] font-medium text-ink-mute uppercase tracking-wider">
            Ruta de la foto
          </label>
          <input
            type="text"
            value={data.photo}
            onChange={e => update({ photo: e.target.value })}
            className="input-apple mt-2 w-full"
            placeholder="/images/fran.jpg"
          />
          <p className="text-[12px] text-ink-mute mt-1">
            Sube la imagen a <code className="text-[11px]">public/images/</code> y pon la ruta aquí.
          </p>
        </div>

        {/* Bio — texto largo */}
        <div>
          <label className="text-[12px] font-medium text-ink-mute uppercase tracking-wider">
            Biografía
          </label>
          <p className="text-[12px] text-ink-mute mt-1 mb-2">
            Escribe en párrafos separados por líneas en blanco. Se renderizarán como párrafos individuales.
          </p>
          <textarea
            value={data.bio}
            onChange={e => update({ bio: e.target.value })}
            rows={10}
            className="input-apple w-full resize-y text-[15px] leading-relaxed"
            placeholder={"Me llamo Fran y estudio...\n\nEste proyecto nació como...\n\nMás allá de las finanzas..."}
          />
        </div>

        {/* Datos rápidos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-[12px] font-medium text-ink-mute uppercase tracking-wider">
              Datos rápidos
            </label>
            <button onClick={addFact} className="btn-ghost text-[13px] py-1 px-3">
              + Añadir
            </button>
          </div>
          <div className="space-y-3">
            {data.facts.map((fact, i) => (
              <div key={i} className="flex items-start gap-2">
                <input
                  type="text"
                  value={fact.emoji}
                  onChange={e => updateFact(i, { emoji: e.target.value })}
                  className="input-apple w-14 text-center text-lg"
                  placeholder="📍"
                />
                <input
                  type="text"
                  value={fact.label}
                  onChange={e => updateFact(i, { label: e.target.value })}
                  className="input-apple w-32"
                  placeholder="Etiqueta"
                />
                <input
                  type="text"
                  value={fact.value}
                  onChange={e => updateFact(i, { value: e.target.value })}
                  className="input-apple flex-1"
                  placeholder="Valor"
                />
                <button
                  onClick={() => removeFact(i)}
                  className="p-2 text-ink-mute hover:text-red-500 transition-colors"
                  title="Eliminar"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            {data.facts.length === 0 && (
              <p className="text-[14px] text-ink-mute text-center py-4">
                Aún no hay datos rápidos. Pulsa &ldquo;+ Añadir&rdquo; para crear uno.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
