import fs from 'node:fs'
import path from 'node:path'

const headingIds: Record<string, string> = {
  'Introducción:': 'introduccion',
  'Los hechos más recientes': 'hechos-recientes',
  'Cómo Japón llegó hasta aquí': 'como-japon-llego-hasta-aqui',
  'El yen como moneda de financiación: el carry trade': 'carry-trade',
  'El régimen empieza a cambiar: inflación y normalización del BoJ': 'normalizacion-boj',
  'Takaichi: la dama de hierro japonesa': 'takaichi',
  'El problema cruza el Pacífico': 'el-problema-cruza-el-pacifico',
}

export type JapanArticleSection = {
  id: string
  heading: string
  paragraphs: string[]
}

export type JapanArticleContent = {
  title: string
  sections: JapanArticleSection[]
}

export function getJapanArticleContent(): JapanArticleContent {
  const sourcePath = path.join(process.cwd(), 'content/articles/el-caso-japon.txt')
  const lines = fs.readFileSync(sourcePath, 'utf8').replace(/\r/g, '').trim().split('\n')
  const title = lines.shift() ?? ''
  const sections: JapanArticleSection[] = []

  for (const line of lines) {
    const id = headingIds[line]
    if (id) {
      sections.push({ id, heading: line, paragraphs: [] })
      continue
    }

    sections.at(-1)?.paragraphs.push(line)
  }

  return { title, sections }
}

export const japanArticleImages = {
  hero: '/images/articles/el-caso-japon/hero.jpg',
  linkedinCover: '/images/articles/el-caso-japon/linkedin-cover.jpg',
  nixonSpeech: '/images/articles/el-caso-japon/nixon-speech.jpg',
  bankOfJapan: '/images/articles/el-caso-japon/bank-of-japan.jpg',
} as const
