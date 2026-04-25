import Image from 'next/image'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'

export const metadata = {
  title: 'Sobre mí — Markets & Finance',
  description: 'Quién soy, a qué me dedico y por qué escribo sobre mercados, finanzas y economía.',
}

export const revalidate = 3600

interface Fact { emoji: string; label: string; value: string }
interface AboutData {
  greeting: string
  photo: string
  bio: string
  facts: Fact[]
}

async function getAbout(): Promise<AboutData> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'about')
    .single()

  const defaults: AboutData = {
    greeting: 'Hola 👋',
    photo: '/images/fran.jpg',
    bio: `Tengo 21 años y actualmente curso el último año del Grado en Economía en la Universidad de Murcia. Mis principales áreas de interés son la macroeconomía, la econometría y los mercados financieros, aunque disfruto explorando cualquier ámbito relacionado con la economía y sus distintas ramas.

De forma complementaria a mis estudios, desempeño actualmente un rol como auxiliar administrativo en Inversus Group, una compañía con sede en Murcia, mi ciudad.

Además, encuentro en la lectura y el estudio extracurricular una forma de profundizar en aquellas áreas que más me interesan. Parte de ese aprendizaje lo condenso posteriormente en artículos y publicaciones que comparto en mis redes para quienes también sienten curiosidad por estos temas.

Este proyecto nace como una extensión de mi pasión por la economía y los mercados financieros, y como una forma de centralizar todo el contenido que hasta ahora he ido compartiendo por distintas vías.

Espero que lo disfrutes y encuentres interesante. Gracias por leerme 👋`,
    facts: [],
  }

  if (data?.value) {
    try { return JSON.parse(data.value) } catch { return defaults }
  }
  return defaults
}

export default async function SobreMiPage() {
  const about = await getAbout()
  const paragraphs = about.bio
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)

  return (
    <div className="container-narrow pt-24 pb-32">
      <header className="text-center mb-16 animate-fade-in">
        <p className="eyebrow">Sobre mí</p>
        <h1 className="mt-4 text-display">{about.greeting}</h1>
      </header>

      <div className="max-w-2xl mx-auto space-y-12 animate-fade-up">
        {/* Foto */}
        {about.photo && (
          <div className="flex justify-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-[2rem] overflow-hidden ring-4 ring-canvas-alt shadow-apple">
              <Image
                src={about.photo}
                alt="Foto de perfil"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}

        {/* Bio */}
        {paragraphs.length > 0 ? (
          <div className="space-y-6 text-[17px] leading-relaxed text-ink-soft">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        ) : (
          <p className="text-center text-ink-mute text-[17px]">
            Pronto escribiré algo aquí.
          </p>
        )}

        {/* Datos rápidos */}
        {about.facts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {about.facts.map((f, i) => (
              <div key={i} className="card p-4 text-center">
                <span className="text-2xl">{f.emoji}</span>
                <p className="mt-2 text-[12px] text-ink-mute uppercase tracking-wider">{f.label}</p>
                <p className="mt-1 text-[14px] font-medium text-ink">{f.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <p className="text-[15px] text-ink-mute mb-5">
            Si quieres recibir lo que publico, suscríbete — es gratis y sin spam.
          </p>
          <Link href="/#suscribirse" className="btn-primary">Suscribirse</Link>
        </div>
      </div>
    </div>
  )
}
