'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [honeypot, setHoneypot] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null)
  const [backgroundImage, setBackgroundImage] = useState('')

  // Array de imágenes de fondo (por ahora con placeholders, se actualizarán con las reales)
  const backgroundImages = [
    '/images/backgrounds/nyse-trading-floor.jpg',
    '/images/backgrounds/skyscrapers.jpg',
    '/images/backgrounds/finance-3.jpg',
    '/images/backgrounds/finance-4.jpg',
    '/images/backgrounds/finance-5.jpg',
    '/images/backgrounds/finance-6.jpg',
    '/images/backgrounds/finance-7.jpg',
    '/images/backgrounds/finance-8.jpg',
    '/images/backgrounds/finance-9.jpg',
    '/images/backgrounds/finance-10.jpg',
    '/images/backgrounds/finance-11.jpg',
    '/images/backgrounds/finance-12.jpg',
    '/images/backgrounds/finance-13.jpg',
    '/images/backgrounds/finance-14.jpg',
    '/images/backgrounds/finance-15.jpg',
    '/images/backgrounds/finance-16.jpg',
    '/images/backgrounds/finance-17.jpg',
    '/images/backgrounds/finance-18.jpg',
    '/images/backgrounds/finance-19.jpg',
    '/images/backgrounds/finance-20.jpg',
  ]

  // Seleccionar imagen aleatoria al cargar la página
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * backgroundImages.length)
    setBackgroundImage(backgroundImages[randomIndex])
  }, [backgroundImages])

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
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      {/* Contenido principal */}
      <div className="relative z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Markets & Finance
          </h1>
          <p className="text-gray-600">
            Newsletter semanal con las últimas noticias de mercados y finanzas
          </p>
        </div>

        {/* Warning sobre SPAM y Horario */}
        <div className="mb-6 space-y-4">
          {/* Warning sobre SPAM */}
          <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Importante: Verificar Bandeja de Spam
                </h3>
                <div className="mt-2 text-sm text-amber-700">
                  <p className="mb-2">
                    Es posible que la primera newsletter se reciba en la carpeta de Spam. 
                    Te recomendamos:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Revisar tu carpeta de Spam en las horas cercanas a la publicación</li>
                    <li>Marcar el email como &quot;No es Spam&quot; para evitar que vuelva a ocurrir</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Horario de envío */}
          <div className="bg-blue-50/90 border border-blue-200 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Horario de Envío
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  Las newsletters se envían todos los <strong>domingos de 10:00 a 14:00</strong> (hora española).
                </p>
              </div>
            </div>
          </div>
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white/80 backdrop-blur-sm"
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isSubmitting ? 'Suscribiendo...' : 'Suscribirse'}
          </button>
        </form>

        {/* Mensajes */}
        {message && (
          <div className={`mt-4 p-4 rounded-lg backdrop-blur-sm ${
            message.type === 'success' 
              ? 'bg-green-50/90 text-green-800 border border-green-200' 
              : message.type === 'error'
              ? 'bg-red-50/90 text-red-800 border border-red-200'
              : 'bg-blue-50/90 text-blue-800 border border-blue-200'
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