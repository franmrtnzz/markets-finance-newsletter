import Link from 'next/link'
import { listPublishedArticles } from '@/lib/content'

export const metadata = {
  title: 'Artículos — Markets & Finance',
  description: 'Artículos y análisis en PDF.',
}

export const revalidate = 60

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticlesIndexPage() {
  const items = await listPublishedArticles()

  return (
    <div className="container-apple pt-24 pb-32">
      <header className="text-center mb-16">
        <p className="eyebrow">Lecturas</p>
        <h1 className="mt-4 text-display">Artículos</h1>
        <p className="mt-4 text-[17px] text-ink-soft max-w-xl mx-auto">
          Análisis más largos en PDF sobre temas que me interesan.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="container-narrow">
          <div className="card p-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-canvas-alt grid place-items-center mx-auto">
              <svg className="w-6 h-6 text-ink-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="mt-6 text-title">Aún no hay artículos</h2>
            <p className="mt-2 text-[15px] text-ink-soft">Pronto subiré los primeros.</p>
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map(a => (
            <Link key={a.id} href={`/articulos/${a.slug}`} className="card card-hover overflow-hidden flex flex-col">
              {a.cover_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover_url} alt="" className="w-full aspect-[16/10] object-cover" />
              ) : (
                <div className="w-full aspect-[16/10] bg-gradient-to-br from-canvas-alt to-line-soft grid place-items-center">
                  <svg className="w-10 h-10 text-ink-mute" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              )}
              <div className="p-6 flex flex-col flex-1">
                <time className="text-[12px] text-ink-mute">
                  {a.published_at ? formatDate(a.published_at) : ''}
                </time>
                <h3 className="mt-2 text-[18px] font-semibold tracking-tight text-ink">{a.title}</h3>
                {a.excerpt && (
                  <p className="mt-2 text-[14px] text-ink-soft line-clamp-3 flex-1">{a.excerpt}</p>
                )}
                {a.tags?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {a.tags.slice(0, 3).map(t => (
                      <span key={t} className="text-[11px] text-ink-soft bg-canvas-alt px-2 py-1 rounded-full">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

