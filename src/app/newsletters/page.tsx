import Link from 'next/link'
import { listPublishedNewsletters } from '@/lib/content'

export const metadata = {
  title: 'Newsletters — Markets & Finance',
  description: 'Archivo de todas las newsletters publicadas.',
}

// Revalidar cada hora; las publicaciones nuevas aparecen rápido sin coste.
export const revalidate = 3600

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function NewslettersIndexPage() {
  const items = await listPublishedNewsletters()

  return (
    <div className="container-narrow pt-24 pb-32">
      <header className="text-center mb-16">
        <p className="eyebrow">Archivo</p>
        <h1 className="mt-4 text-display">Newsletters</h1>
        <p className="mt-4 text-[17px] text-ink-soft max-w-xl mx-auto">
          Todas las ediciones publicadas, ordenadas de la más reciente a la más antigua.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="w-12 h-12 rounded-2xl bg-canvas-alt grid place-items-center mx-auto">
            <svg className="w-6 h-6 text-ink-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.5 5.25a2 2 0 002.25 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="mt-6 text-title">Aún no hay ediciones publicadas</h2>
          <p className="mt-2 text-[15px] text-ink-soft">Pronto aparecerán aquí.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line-soft border-t border-b border-line-soft">
          {items.map(n => (
            <li key={n.id}>
              <Link
                href={`/newsletters/${n.slug}`}
                className="group flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-6 py-6 hover:bg-canvas-alt/50 -mx-4 px-4 rounded-xl transition-colors"
              >
                <time className="text-[13px] text-ink-mute sm:w-32 shrink-0 tabular-nums">
                  {n.published_at ? formatDate(n.published_at) : ''}
                </time>
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold tracking-tight text-ink group-hover:text-accent transition-colors">
                    {n.title}
                  </h3>
                  {n.excerpt && (
                    <p className="mt-1 text-[14px] text-ink-soft line-clamp-2">{n.excerpt}</p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

