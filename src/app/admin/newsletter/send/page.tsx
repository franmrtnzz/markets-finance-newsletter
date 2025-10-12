'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SendNewsletter() {
  const [title, setTitle] = useState('')
  const [preheader, setPreheader] = useState('')
  const [content, setContent] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [totalEmails, setTotalEmails] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Obtener total de emails (activos e inactivos) desde las estadísticas
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/admin/stats')
        if (res.ok) {
          const data = await res.json()
          setTotalEmails(data.subscribers?.total ?? 0)
        }
      } catch (e) {
        // ignorar
      }
    }
    fetchCount()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      setMessage({ text: 'Título y contenido son requeridos', type: 'error' })
      return
    }

    setIsSending(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          preheader: preheader.trim(),
          content: content.trim()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ 
          text: `¡Newsletter enviado exitosamente a ${data.sentCount} direcciones!`, 
          type: 'success' 
        })
        
        // Limpiar formulario
        setTitle('')
        setPreheader('')
        setContent('')
        
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          router.push('/admin')
        }, 3000)
      } else {
        setMessage({ text: data.error || 'Error al enviar newsletter', type: 'error' })
      }
    } catch (error) {
      setMessage({ text: 'Error de conexión. Inténtalo de nuevo.', type: 'error' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Enviar Newsletter</h1>
              <p className="text-gray-600 mt-2">
                Crea y envía tu newsletter semanal a <strong>todas las direcciones registradas</strong>
              </p>
            </div>
            <Link
              href="/admin"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Volver al Dashboard
            </Link>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título del Newsletter *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Markets & Finance - Semana del 18-24 de Agosto"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
                disabled={isSending}
              />
            </div>

            {/* Preheader */}
            <div>
              <label htmlFor="preheader" className="block text-sm font-medium text-gray-700 mb-2">
                Preheader (opcional)
              </label>
              <input
                type="text"
                id="preheader"
                value={preheader}
                onChange={(e) => setPreheader(e.target.value)}
                placeholder="Ej: Resumen semanal de mercados, finanzas y economía"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isSending}
              />
            </div>

            {/* Contenido */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido del Newsletter *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe aquí el contenido de tu newsletter..."
                rows={12}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                required
                disabled={isSending}
              />
              <p className="text-sm text-gray-500 mt-2">
                Puedes usar HTML básico para dar formato a tu newsletter.
              </p>
            </div>

            {/* Mensajes */}
            {message && (
              <div className={`p-4 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link
                href="/admin"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSending}
                className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? 'Enviando...' : 'Enviar Newsletter'}
              </button>
            </div>
          </form>
        </div>

        {/* Información adicional */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            ⚠️ Importante
          </h3>
          <ul className="text-blue-800 space-y-2">
            <li>• El newsletter se enviará <strong>inmediatamente</strong> a <strong>todas las direcciones registradas</strong></li>
            <li>• Esta acción <strong>no se puede deshacer</strong></li>
            <li>• Se enviará a <strong>{totalEmails ?? '...'}</strong> direcciones actualmente</li>
            <li>• El contenido se guardará en la base de datos para futuras referencias</li>
          </ul>
        </div>
      </div>
    </div>
  )
} 