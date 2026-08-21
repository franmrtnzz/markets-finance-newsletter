import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ArticleReadingProgress from '@/components/ArticleReadingProgress'
import { nobelArticle, nobelArticleImages } from '@/lib/nobel-economia-2025'

export const metadata: Metadata = {
  title: 'Nobel de Economía 2025 — Markets & Finance',
  description: nobelArticle.subtitle,
  openGraph: {
    title: 'Nobel de Economía 2025',
    description: nobelArticle.subtitle,
    images: [{ url: nobelArticleImages.hero, width: 634, height: 407 }],
    type: 'article',
  },
}

const pullQuotes = new Set([
  '«Lo que hay que explicar es la riqueza, pues la pobreza siempre fue condición estándar de la humanidad.» — Miguel Anxo Bastos.',
  '“La innovación es la madre de la prosperidad y la hija de la libertad.” — Matt Ridley.',
])

export default function NobelEconomia2025Page() {
  return (
    <>
      <ArticleReadingProgress />

      <article className="japan-article nobel-article" data-longform-article>
        <header className="nobel-article__hero">
          <div className="container-apple nobel-article__hero-inner">
            <Link href="/articulos" className="japan-article__back">
              ← Artículos
            </Link>
            <div className="nobel-article__hero-grid">
              <div className="nobel-article__hero-copy">
                <p className="japan-article__kicker">Markets &amp; Finance · Ensayo</p>
                <h1>{nobelArticle.title}</h1>
                <p className="nobel-article__subtitle">{nobelArticle.subtitle}</p>
                <p className="japan-article__date">24 de octubre de 2025</p>
              </div>
              <figure className="nobel-article__portrait">
                <Image
                  src={nobelArticleImages.hero}
                  alt="Retratos ilustrados de Joel Mokyr, Philippe Aghion y Peter Howitt"
                  width={634}
                  height={407}
                  priority
                  sizes="(max-width: 900px) 90vw, 42vw"
                />
              </figure>
            </div>
          </div>
        </header>

        <div className="japan-article__layout container-apple">
          <aside className="japan-article__toc" aria-label="Contenido del artículo">
            <p>En este artículo</p>
            <ol>
              {nobelArticle.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index).padStart(2, '0')}</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="japan-article__body">
            {nobelArticle.sections.map((section, sectionIndex) => (
              <section id={section.id} key={section.id} className="japan-article__section">
                <div className="japan-article__section-heading">
                  <span>{String(sectionIndex).padStart(2, '0')}</span>
                  <h2>{section.heading}</h2>
                </div>

                {section.paragraphs.map((paragraph, paragraphIndex) => (
                  <div key={`${section.id}-${paragraphIndex}`}>
                    <p
                      className={[
                        pullQuotes.has(paragraph) ? 'japan-article__pullquote' : '',
                        sectionIndex === 0 && paragraphIndex === 0 ? 'japan-article__opening' : '',
                      ].filter(Boolean).join(' ')}
                    >
                      {paragraph}
                    </p>

                    {section.id === 'introduccion' && paragraphIndex === 2 && (
                      <>
                        <figure className="japan-article__figure japan-article__figure--wide nobel-article__chart">
                          <Image src={nobelArticleImages.figure1} alt="PIB per cápita en Inglaterra entre 1300 y 1680" width={1612} height={910} sizes="(max-width: 900px) 100vw, 960px" />
                          <figcaption>Figura 1: PIB per cápita en Inglaterra 1300–1680, con innovaciones destacadas. El eje vertical es logarítmico. Fuente de datos: Broadberry et al. (2015).</figcaption>
                        </figure>
                        <figure className="japan-article__figure japan-article__figure--wide nobel-article__chart">
                          <Image src={nobelArticleImages.figure2} alt="PIB real per cápita de Reino Unido y Estados Unidos entre 1800 y 2018" width={1642} height={946} sizes="(max-width: 900px) 100vw, 960px" />
                          <figcaption>Figura 2: PIB real per cápita, 1800–2018. (a) Reino Unido, (b) Estados Unidos.</figcaption>
                        </figure>
                        <figure className="japan-article__figure japan-article__figure--wide nobel-article__chart">
                          <Image src={nobelArticleImages.figure3} alt="PIB per cápita de China, Reino Unido, Estados Unidos y el mundo entre 1252 y 2022" width={2204} height={1206} sizes="(max-width: 900px) 100vw, 960px" />
                          <figcaption>Figura 3: PIB per cápita 1252–2022 (China, Reino Unido, Estados Unidos y Mundo).</figcaption>
                        </figure>
                      </>
                    )}
                  </div>
                ))}
              </section>
            ))}

            <footer className="japan-article__footer">
              <span aria-hidden="true">M&amp;F</span>
              <Link href="/articulos">Volver a Artículos</Link>
            </footer>
          </div>
        </div>
      </article>
    </>
  )
}
