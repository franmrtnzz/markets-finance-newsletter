import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import ArticleReadingProgress from '@/components/ArticleReadingProgress'
import { getJapanArticleContent, japanArticleImages } from '@/lib/el-caso-japon'

export const metadata: Metadata = {
  title: 'El caso Japón. La gran anomalía monetaria. — Markets & Finance',
  description: 'Han pasado 55 años desde que Richard Nixon salió a la palestra para anunciar una decisión que cambiaría para siempre el sistema monetario: la suspensión de la convertibilidad del dólar en oro.',
  openGraph: {
    title: 'El caso Japón. La gran anomalía monetaria.',
    description: 'Han pasado 55 años desde que Richard Nixon salió a la palestra para anunciar una decisión que cambiaría para siempre el sistema monetario: la suspensión de la convertibilidad del dólar en oro.',
    images: [{ url: japanArticleImages.linkedinCover, width: 1280, height: 720 }],
    type: 'article',
  },
}

const pullQuotes = new Set([
  'Pocos países permiten estudiar esas relaciones con tanta claridad como Japón.',
  'Hasta aquí, nada novedoso. Lo verdaderamente excepcional ocurriría a posteriori.',
  'El resultado: el yen pasó a convertirse en una de las principales monedas de financiación a nivel internacional.',
  'Este mecanismo recibe el nombre de carry trade.',
  'Aquí aparece una de las grandes tensiones del caso Japón.',
  'Y en medio de esa tensión se encuentra el yen.',
  'Quizá la cuestión no fuese únicamente sostener el yen.',
  'En otras palabras: el yen estaba cayendo en Tokio, pero una parte importante del riesgo podía terminar materializándose en Washington.',
])

export default function ElCasoJaponPage() {
  const article = getJapanArticleContent()

  return (
    <>
      <ArticleReadingProgress />

      <article className="japan-article" data-longform-article>
        <header className="japan-article__hero">
          <Image
            src={japanArticleImages.hero}
            alt="Sanae Takaichi pronunciando un discurso en la Casa Blanca"
            fill
            priority
            sizes="100vw"
            className="japan-article__hero-image"
          />
          <div className="japan-article__hero-shade" />
          <div className="container-apple japan-article__hero-inner">
            <Link href="/articulos" className="japan-article__back">
              ← Artículos
            </Link>
            <div className="japan-article__hero-copy">
              <p className="japan-article__kicker">Markets &amp; Finance · Artículo</p>
              <h1>{article.title}</h1>
              <p className="japan-article__date">21 de agosto de 2026</p>
            </div>
          </div>
          <p className="japan-article__hero-credit">
            Fotografía oficial de la Casa Blanca · Joyce N. Boghosian
          </p>
        </header>

        <div className="japan-article__layout container-apple">
          <aside className="japan-article__toc" aria-label="Contenido del artículo">
            <p>En este artículo</p>
            <ol>
              {article.sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    {section.heading.replace(/:$/, '')}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="japan-article__body">
            {article.sections.map((section, sectionIndex) => (
              <section id={section.id} key={section.id} className="japan-article__section">
                <div className="japan-article__section-heading">
                  <span>{String(sectionIndex + 1).padStart(2, '0')}</span>
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

                    {section.id === 'introduccion' && paragraphIndex === 1 && (
                      <figure className="japan-article__figure japan-article__figure--wide">
                        <Image
                          src={japanArticleImages.nixonSpeech}
                          alt="Richard Nixon anunciando por televisión su nueva política económica el 15 de agosto de 1971"
                          width={1440}
                          height={1080}
                          sizes="(max-width: 900px) 100vw, 960px"
                        />
                        <figcaption>
                          Richard Nixon durante el discurso televisado del 15 de agosto de 1971. Fuente: Richard Nixon Presidential Library.
                        </figcaption>
                      </figure>
                    )}

                    {section.id === 'carry-trade' && paragraphIndex === section.paragraphs.length - 1 && (
                      <figure className="japan-article__figure japan-article__figure--wide">
                        <Image
                          src={japanArticleImages.bankOfJapan}
                          alt="Sede central del Banco de Japón en Tokio"
                          width={1440}
                          height={933}
                          sizes="(max-width: 900px) 100vw, 960px"
                        />
                        <figcaption>
                          Sede central del Banco de Japón en Tokio. Fotografía: Fg2, dominio público.
                        </figcaption>
                      </figure>
                    )}

                    {section.id === 'takaichi' && paragraphIndex === 0 && (
                      <figure className="japan-article__figure japan-article__figure--wide">
                        <Image
                          src={japanArticleImages.takaichiDietSpeech}
                          alt="Sanae Takaichi pronunciando su discurso de política general ante la Dieta japonesa"
                          width={1920}
                          height={1280}
                          sizes="(max-width: 900px) 100vw, 688px"
                        />
                        <figcaption>
                          Sanae Takaichi durante su discurso de política general ante la Dieta, el 24 de octubre de 2025. Fotografía: Cabinet Public Affairs Office, CC BY 4.0.
                        </figcaption>
                      </figure>
                    )}

                    {section.id === 'el-problema-cruza-el-pacifico' && paragraphIndex === 1 && (
                      <figure className="japan-article__figure japan-article__figure--wide">
                        <Image
                          src={japanArticleImages.scottBessentBriefing}
                          alt="Scott Bessent durante una comparecencia en la sala de prensa de la Casa Blanca"
                          width={1767}
                          height={1326}
                          sizes="(max-width: 900px) 100vw, 560px"
                        />
                        <figcaption>
                          Scott Bessent durante una comparecencia en la Casa Blanca, el 28 de mayo de 2026. Fotografía oficial de la Casa Blanca · Abe McNatt.
                        </figcaption>
                      </figure>
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
