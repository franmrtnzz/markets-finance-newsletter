import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getNewsletterBySlug } from '@/lib/content'
import Engagement from '@/components/Engagement'

export const revalidate = 3600

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const n = await getNewsletterBySlug(params.slug)
  if (!n) return { title: 'Newsletter no encontrada' }
  return {
    title: `${n.title} — Markets & Finance`,
    description: n.excerpt ?? undefined,
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function NewsletterDetailPage({ params }: { params: { slug: string } }) {
  const n = await getNewsletterBySlug(params.slug)
  if (!n) notFound()

  return (
    <article className="container-narrow pt-20 pb-24">
      <Link href="/newsletters" className="text-[13px] text-ink-mute hover:text-ink transition-colors">
        ← Newsletters
      </Link>

      <header className="mt-8 text-center border-b border-line-soft pb-10">
        <p className="eyebrow">Newsletter</p>
        <h1 className="mt-4 text-display">{n.title}</h1>
        {n.published_at && (
          <p className="mt-4 text-[14px] text-ink-mute">{formatDate(n.published_at)}</p>
        )}
        {n.excerpt && (
          <p className="mt-6 text-[17px] text-ink-soft max-w-xl mx-auto">{n.excerpt}</p>
        )}
      </header>

      {/* HTML pegado: lo encerramos en un contenedor que aísla un poco los estilos
          y le da un look limpio coherente con el resto de la web. */}
      <div
        className="newsletter-html mt-10 mx-auto"
        dangerouslySetInnerHTML={{ __html: n.html }}
      />

      <Engagement contentType="newsletter" contentId={n.id} />
    </article>
  )
}
