'use client'
import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage({ text: 'Por favor, introduce tu email', type: 'error' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), honeypot }),
      })

      const data = await response.json()

      if (response.ok) {
        if (data.alreadySubscribed) {
          setMessage({ text: data.message, type: 'info' })
        } else if (data.reactivated) {
          setMessage({ text: data.message, type: 'success' })
        } else {
          setMessage({ text: data.message, type: 'success' })
          setEmail('') // Limpiar formulario solo si es nueva suscripción
        }
      } else {
        setMessage({ text: data.error || 'Error al suscribirse', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'Error de conexión. Inténtalo de nuevo.', type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Markets & Finance
          </h1>
          <p className="text-gray-600">
            Newsletter semanal con las últimas noticias de mercados y finanzas
          </p>
        </div>

        {/* Formulario de suscripción */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo de email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Honeypot (oculto) */}
          <input
            type="text"
            name="website"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Botón de suscripción */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Suscribiendo...' : 'Suscribirse'}
          </button>
        </form>

        {/* Mensajes */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : message.type === 'error'
              ? 'bg-red-50 text-red-800 border border-red-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Al suscribirte, aceptas recibir emails semanales. 
            Puedes darte de baja en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  )
} 