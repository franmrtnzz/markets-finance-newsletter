'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function UnsubscribeSuccess() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Icono de éxito */}
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          ¡Desuscripción exitosa!
        </h1>

        {/* Mensaje */}
        <p className="text-gray-600 mb-6">
          {email ? (
            <>
              El email <span className="font-medium">{email}</span> ha sido removido de nuestra lista de suscriptores.
            </>
          ) : (
            'Has sido removido exitosamente de nuestra lista de suscriptores.'
          )}
        </p>

        <p className="text-gray-500 text-sm mb-8">
          Ya no recibirás más emails de Markets & Finance.
        </p>

        {/* Botón para volver */}
        <Link 
          href="/"
          className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Volver al inicio
        </Link>

        {/* Información adicional */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            ¿Cambiaste de opinión? Puedes volver a suscribirte en cualquier momento.
          </p>
        </div>
      </div>
    </div>
  )
} 