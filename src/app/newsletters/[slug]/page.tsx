import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getNewsletterBySlug } from '@/lib/content'
import { safeDecodeSlug } from '@/lib/slugs'
import { getNewsletterHeroVideo } from '@/lib/newsletter-hero-videos'
import Engagement from '@/components/Engagement'

export const revalidate = 60

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
  if (safeDecodeSlug(params.slug) !== n.slug) redirect(`/newsletters/${n.slug}`)
  const heroVideo = getNewsletterHeroVideo(n.slug)

  return (
    <article className="pb-24">
      <section
        className={`newsletter-hero relative isolate overflow-hidden ${heroVideo ? 'newsletter-hero--video' : ''}`}
        style={heroVideo ? {
          backgroundImage: `linear-gradient(rgba(245, 245, 247, 0.18), rgba(245, 245, 247, 0.26)), url(${heroVideo.poster})`,
        } : undefined}
      >
        {heroVideo && (
          <>
            <video
              className="newsletter-hero__media"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={heroVideo.poster}
              aria-hidden="true"
              tabIndex={-1}
            >
              <source src={heroVideo.mobile} media="(max-width: 767px)" type="video/mp4" />
              <source src={heroVideo.desktop} type="video/mp4" />
            </video>
            <div className="newsletter-hero__overlay" aria-hidden="true" />
          </>
        )}

        <div className="newsletter-hero__content container-narrow relative z-10 py-14 sm:py-20">
          <Link href="/newsletters" className="newsletter-hero__back">
            ← Newsletters
          </Link>

          <header className="mt-12 text-center">
            <p className="eyebrow">Newsletter</p>
            <h1 className="mt-4 text-hero">{n.title}</h1>
            {n.published_at && (
              <p className="mt-5 text-[14px] text-ink-mute">{formatDate(n.published_at)}</p>
            )}
            {n.excerpt && (
              <p className="mt-7 text-[17px] sm:text-[18px] leading-relaxed text-ink-soft max-w-2xl mx-auto">
                {n.excerpt}
              </p>
            )}
          </header>
        </div>
      </section>

      <div className="container-narrow">
        {/* HTML pegado: lo encerramos en un contenedor que aísla un poco los estilos
            y le da un look limpio coherente con el resto de la web. */}
        <div
          className="newsletter-html mt-12 mx-auto"
          dangerouslySetInnerHTML={{ __html: n.html }}
        />

        <Engagement contentType="newsletter" contentId={n.id} />
      </div>
    </article>
  )
}
