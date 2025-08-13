'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface NewsletterForm {
  title: string
  preheader: string
  source_url: string
  content_md: string
  content_html: string
}

export default function NewNewsletterPage() {
  const router = useRouter()
  const [form, setForm] = useState<NewsletterForm>({
    title: '',
    preheader: '',
    source_url: '',
    content_md: '',
    content_html: ''
  })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [previewHtml, setPreviewHtml] = useState('')

  const handleInputChange = (field: keyof NewsletterForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handlePreview = async () => {
    try {
      const response = await fetch('/api/admin/issues/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: form.title,
          preheader: form.preheader,
          content: form.content_md || form.content_html
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPreviewHtml(data.html)
        setIsPreviewMode(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al generar preview')
      }
    } catch (error) {
      setError('Error de conexión')
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) {
      setError('El título es obligatorio')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }),
      })

      if (response.ok) {
        const data = await response.json()
        router.push(`/admin/issues/${data.id}`)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Error al guardar')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendNow = async () => {
    if (!form.title.trim()) {
      setError('El título es obligatorio')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // First save as draft
      const saveResponse = await fetch('/api/admin/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        setError(errorData.error || 'Error al guardar')
        return
      }

      const saveData = await saveResponse.json()

      // Then send immediately
      const sendResponse = await fetch(`/api/admin/issues/${saveData.id}/send`, {
        method: 'POST',
      })

      if (sendResponse.ok) {
        router.push('/admin/issues')
      } else {
        const errorData = await sendResponse.json()
        setError(errorData.error || 'Error al enviar')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSchedule = async () => {
    if (!form.title.trim()) {
      setError('El título es obligatorio')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // First save as draft
      const saveResponse = await fetch('/api/admin/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...form,
          slug: form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        }),
      })

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json()
        setError(errorData.error || 'Error al guardar')
        return
      }

      const saveData = await saveResponse.json()

      // Then schedule for Sunday
      const nextSunday = new Date()
      nextSunday.setDate(nextSunday.getDate() + (7 - nextSunday.getDay()))
      nextSunday.setHours(8, 0, 0, 0) // 8:00 UTC

      const scheduleResponse = await fetch(`/api/admin/issues/${saveData.id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scheduled_at: nextSunday.toISOString()
        }),
      })

      if (scheduleResponse.ok) {
        router.push('/admin/issues')
      } else {
        const errorData = await scheduleResponse.json()
        setError(errorData.error || 'Error al programar')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isPreviewMode) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Preview Newsletter
              </h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsPreviewMode(false)}
                  className="btn-secondary"
                >
                  Volver a Editar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Borrador'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              Nuevo Newsletter
            </h1>
            <div className="flex space-x-4">
              <Link href="/admin" className="btn-secondary">
                Volver al Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Información del Newsletter</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="input-field"
                placeholder="Título del newsletter"
                required
              />
            </div>

            {/* Preheader */}
            <div>
              <label htmlFor="preheader" className="block text-sm font-medium text-gray-700 mb-2">
                Preheader
              </label>
              <input
                id="preheader"
                type="text"
                value={form.preheader}
                onChange={(e) => handleInputChange('preheader', e.target.value)}
                className="input-field"
                placeholder="Texto que aparece en el preview del email"
              />
              <p className="mt-1 text-sm text-gray-500">
                Aparece en el preview del email (máximo 150 caracteres)
              </p>
            </div>

            {/* Source URL */}
            <div>
              <label htmlFor="source_url" className="block text-sm font-medium text-gray-700 mb-2">
                URL de Fuente
              </label>
              <input
                id="source_url"
                type="url"
                value={form.source_url}
                onChange={(e) => handleInputChange('source_url', e.target.value)}
                className="input-field"
                placeholder="https://ejemplo.com/noticia"
              />
            </div>

            {/* Content Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contenido
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="content_type"
                    value="markdown"
                    defaultChecked
                    className="mr-2"
                  />
                  Markdown
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="content_type"
                    value="html"
                    className="mr-2"
                  />
                  HTML
                </label>
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Contenido *
              </label>
              <textarea
                id="content"
                rows={15}
                value={form.content_md || form.content_html}
                onChange={(e) => {
                  const radioValue = (document.querySelector('input[name="content_type"]:checked') as HTMLInputElement)?.value
                  if (radioValue === 'html') {
                    handleInputChange('content_html', e.target.value)
                    handleInputChange('content_md', '')
                  } else {
                    handleInputChange('content_md', e.target.value)
                    handleInputChange('content_html', '')
                  }
                }}
                className="input-field font-mono"
                placeholder="Escribe tu contenido aquí..."
                required
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between pt-6">
              <div className="flex space-x-4">
                <button
                  onClick={handlePreview}
                  className="btn-secondary"
                >
                  Previsualizar
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="btn-primary disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Borrador'}
                </button>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleSchedule}
                  disabled={isSubmitting}
                  className="btn-secondary disabled:opacity-50"
                >
                  {isSubmitting ? 'Programando...' : 'Programar Domingo'}
                </button>
                <button
                  onClick={handleSendNow}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Ahora'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 