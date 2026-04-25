import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getArticleBySlug } from '@/lib/content'
import Engagement from '@/components/Engagement'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const a = await getArticleBySlug(params.slug)
  if (!a) return { title: 'Artículo no encontrado' }
  return {
    title: `${a.title} — Markets & Finance`,
    description: a.excerpt ?? undefined,
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const a = await getArticleBySlug(params.slug)
  if (!a) notFound()

  return (
    <article className="container-narrow pt-20 pb-24">
      <Link href="/articulos" className="text-[13px] text-ink-mute hover:text-ink transition-colors">
        ← Artículos
      </Link>

      <header className="mt-8 text-center">
        <p className="eyebrow">Artículo</p>
        <h1 className="mt-4 text-display">{a.title}</h1>
        {a.published_at && (
          <p className="mt-4 text-[14px] text-ink-mute">{formatDate(a.published_at)}</p>
        )}
        {a.excerpt && (
          <p className="mt-6 text-[17px] text-ink-soft max-w-xl mx-auto">{a.excerpt}</p>
        )}
        {a.tags?.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-1.5">
            {a.tags.map(t => (
              <span key={t} className="text-[11px] text-ink-soft bg-canvas-alt px-2.5 py-1 rounded-full">
                {t}
              </span>
            ))}
          </div>
        )}
      </header>

      {a.description && (
        <div className="mt-10 text-[16px] leading-relaxed text-ink whitespace-pre-wrap">
          {a.description}
        </div>
      )}

      {a.pdf_url && (
        <div className="mt-10">
          <div className="card overflow-hidden">
            <iframe
              src={a.pdf_url}
              className="w-full h-[80vh] bg-canvas-alt"
              title={a.title}
            />
          </div>
          <div className="mt-4 text-center">
            <a
              href={a.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Abrir PDF en otra pestaña
            </a>
          </div>
        </div>
      )}

      <Engagement contentType="article" contentId={a.id} />
    </article>
  )
}
