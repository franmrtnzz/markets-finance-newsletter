'use client'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function UnsubscribeSuccess() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="container-narrow pt-24 pb-32">
      <div className="card p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-50 grid place-items-center mx-auto">
          <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="mt-6 text-display">Te has dado de baja</h1>

        <p className="mt-4 text-[16px] text-ink-soft max-w-md mx-auto">
          {email ? (
            <>
              Hemos eliminado <span className="font-medium text-ink">{email}</span> de la lista. No recibirás más emails.
            </>
          ) : (
            'Hemos eliminado tu email de la lista. No recibirás más emails.'
          )}
        </p>

        <Link href="/" className="btn-primary mt-10">Volver al inicio</Link>

        <p className="mt-8 text-[13px] text-ink-mute">
          ¿Cambias de opinión? Puedes volver a suscribirte cuando quieras.
        </p>
      </div>
    </div>
  )
}
