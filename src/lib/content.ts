import { createServerClient } from './supabase'
import { normalizeSlug, safeDecodeSlug } from './slugs'
import type { Article, Newsletter, Note } from './types'

// Fetchers públicos: leen siempre con service role en server components
// (RLS también permitiría con anon key, pero usar service role es más simple
// y consistente con el resto del backend).

export async function listPublishedNewsletters(): Promise<Newsletter[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) {
    console.error('listPublishedNewsletters', error)
    return []
  }
  return data ?? []
}

export async function getNewsletterBySlug(slug: string): Promise<Newsletter | null> {
  const supabase = createServerClient()
  const decodedSlug = safeDecodeSlug(slug)
  const candidates = Array.from(new Set([
    slug,
    decodedSlug,
    normalizeSlug(decodedSlug),
    normalizeSlug(slug),
  ].filter(Boolean)))

  const { data, error } = await supabase
    .from('newsletters')
    .select('*')
    .in('slug', candidates)
    .eq('status', 'published')
    .limit(candidates.length)
  if (error) {
    console.error('getNewsletterBySlug', error)
    return null
  }
  return candidates
    .map(candidate => data?.find(newsletter => newsletter.slug === candidate))
    .find(Boolean) ?? null
}

export async function listPublishedArticles(): Promise<Article[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) {
    console.error('listPublishedArticles', error)
    return []
  }
  return data ?? []
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()
  if (error) {
    console.error('getArticleBySlug', error)
    return null
  }
  return data
}

export async function listPublishedNotes(): Promise<Note[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
  if (error) {
    console.error('listPublishedNotes', error)
    return []
  }
  return data ?? []
}
