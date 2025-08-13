import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase'

interface Issue {
  id: string
  title: string
  slug: string
  preheader: string
  content: string
  source_url?: string
  created_at: string
  sent_at?: string
}

export default async function IssuePage({ params }: { params: { slug: string } }) {
  const supabase = createServerClient()
  
  // Obtener el issue por slug
  const { data: issue, error } = await supabase
    .from('issues')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !issue) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Markets & Finance</h1>
              <p className="text-gray-600">Newsletter semanal</p>
            </div>
            <a
              href="/"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Suscribirse
            </a>
          </div>
        </div>
      </div>

      {/* Newsletter Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Newsletter Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white text-center">
            <h1 className="text-4xl font-bold mb-4">{issue.title}</h1>
            {issue.preheader && (
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                {issue.preheader}
              </p>
            )}
            <div className="mt-6 text-blue-200 text-sm">
              {issue.sent_at ? (
                <span>Enviado el {new Date(issue.sent_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              ) : (
                <span>Creado el {new Date(issue.created_at).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              )}
            </div>
          </div>

          {/* Newsletter Body */}
          <div className="px-8 py-12">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: issue.content }}
            />
            
            {issue.source_url && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-2">Fuente:</p>
                <a
                  href={issue.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  {issue.source_url}
                </a>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-8 text-center">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ¿Te gustó este newsletter?
              </h3>
              <p className="text-gray-600 mb-6">
                Recibe las últimas noticias de mercados y finanzas directamente en tu email.
              </p>
              <a
                href="/"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Suscribirse Ahora
              </a>
              <p className="text-xs text-gray-500 mt-4">
                Puedes darte de baja en cualquier momento
              </p>
            </div>
          </div>
        </article>

        {/* Navigation */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-900"
          >
            ← Volver al inicio
          </a>
        </div>
      </div>
    </div>
  )
} 