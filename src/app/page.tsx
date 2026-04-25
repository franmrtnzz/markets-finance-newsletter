'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              'radial-gradient(60% 40% at 50% 0%, rgba(0,113,227,0.06), transparent 70%), linear-gradient(180deg, #fbfbfd 0%, #f5f5f7 100%)',
          }}
        />
        <div className="container-narrow pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <p className="eyebrow animate-fade-in">Newsletter · Artículos · Notas</p>
          <h1 className="mt-5 text-hero text-ink animate-fade-up">
            Mercados y finanzas,
            <br />
            <span className="text-ink-mute">sin ruido.</span>
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-[17px] sm:text-[19px] leading-relaxed text-ink-soft animate-fade-up [animation-delay:80ms]">
            Una newsletter informal que envío cuando me apetece. Más artículos, lecturas
            y notas sobre lo que voy aprendiendo en economía y mercados.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3 animate-fade-up [animation-delay:140ms]">
            <a href="#suscribirse" className="btn-primary">Suscribirse</a>
            <Link href="/newsletters" className="btn-ghost">Ver newsletters</Link>
          </div>
        </div>
      </section>

      {/* SECCIONES DESTACADAS */}
      <section className="container-apple pb-24">
        <div className="grid md:grid-cols-3 gap-5">
          <FeatureCard
            href="/newsletters"
            eyebrow="Newsletter"
            title="Lo último de los mercados"
            description="Archivo de todas las ediciones publicadas. Léelas cuando quieras."
          />
          <FeatureCard
            href="/articulos"
            eyebrow="Artículos"
            title="Análisis y lecturas"
            description="Textos más largos en PDF sobre temas que me interesan."
          />
          <FeatureCard
            href="/notas"
            eyebrow="Notas"
            title="Pensamientos breves"
            description="Ideas sueltas, comentarios y publicaciones cortas."
          />
        </div>
      </section>

      {/* SUSCRIPCIÓN */}
      <section id="suscribirse" className="bg-canvas-alt border-y border-line-soft">
        <div className="container-narrow py-20 sm:py-24">
          <div className="text-center">
            <p className="eyebrow">Newsletter</p>
            <h2 className="mt-4 text-display">Suscríbete.</h2>
            <p className="mt-4 text-[17px] text-ink-soft max-w-lg mx-auto">
              Llegará a tu correo cuando publique. Sin frecuencia fija, sin spam, baja con un clic.
            </p>
          </div>
          <SubscribeForm />
        </div>
      </section>
    </>
  )
}

function FeatureCard({
  href,
  eyebrow,
  title,
  description,
}: {
  href: string
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Link href={href} className="card card-hover p-7 group flex flex-col">
      <span className="eyebrow">{eyebrow}</span>
      <h3 className="mt-3 text-title">{title}</h3>
      <p className="mt-3 text-[15px] text-ink-soft leading-relaxed flex-1">{description}</p>
      <span className="mt-6 inline-flex items-center text-[14px] font-medium text-accent">
        Explorar
        <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.21 5.23a.75.75 0 011.06 0l4.25 4.24a.75.75 0 010 1.06l-4.25 4.24a.75.75 0 11-1.06-1.06L10.94 10 7.21 6.29a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
      </span>
    </Link>
  )
}

function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setMessage({ text: 'Por favor, introduce tu email.', type: 'error' })
      return
    }
    setIsSubmitting(true)
    setMessage(null)
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), honeypot }),
      })
      const data = await response.json()
      if (response.ok) {
        if (data.alreadySubscribed) {
          setMessage({ text: data.message, type: 'info' })
        } else {
          setMessage({ text: data.message, type: 'success' })
          if (!data.reactivated) setEmail('')
        }
      } else {
        setMessage({ text: data.error || 'No se pudo completar la suscripción.', type: 'error' })
      }
    } catch {
      setMessage({ text: 'Error de conexión. Inténtalo de nuevo.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 max-w-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="input-apple flex-1"
          required
          disabled={isSubmitting}
          aria-label="Email"
        />
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
        />
        <button type="submit" disabled={isSubmitting} className="btn-primary sm:w-auto">
          {isSubmitting ? 'Enviando…' : 'Suscribirse'}
        </button>
      </div>

      {message && (
        <div
          role="status"
          className={`mt-4 rounded-2xl px-4 py-3 text-[14px] border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
              : message.type === 'error'
              ? 'bg-red-50 text-red-900 border-red-200'
              : 'bg-blue-50 text-blue-900 border-blue-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="mt-4 text-center text-[12px] text-ink-mute">
        Al suscribirte aceptas recibir emails ocasionales. Baja cuando quieras.
      </p>
    </form>
  )
}
