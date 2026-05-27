// ============================================================================
// Tipos del modelo de contenido (Fase 2)
// ============================================================================

export type ContentType = 'newsletter' | 'article' | 'note'
export type PublishStatus = 'draft' | 'published'

export interface Newsletter {
  id: string
  slug: string
  title: string
  excerpt: string | null
  html: string
  status: PublishStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  slug: string
  title: string
  excerpt: string | null
  description: string | null
  pdf_url: string | null
  pdf_path: string | null
  cover_url: string | null
  tags: string[]
  status: PublishStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Note {
  id: string
  body: string
  status: PublishStatus
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface CommentRecord {
  id: string
  content_type: ContentType
  content_id: string
  user_id: string
  author_name: string | null
  author_avatar: string | null
  body: string
  status: 'visible' | 'hidden'
  parent_id: string | null
  created_at: string
  updated_at: string
}

// ============================================================================
// Noticias candidatas para newsletter cuatrimestral
// ============================================================================

export type NewsCategory = 'economia_general' | 'sector_financiero'
export type NewsScope = 'espana' | 'europa' | 'eeuu' | 'global' | 'otro'
export type NewsStatus = 'pendiente' | 'candidata' | 'descartada' | 'seleccionada'

export interface NewsCandidate {
  id: string
  title: string
  source: string | null
  url: string | null
  published_date: string | null
  saved_at: string
  category: NewsCategory
  scope: NewsScope
  quarter: string
  tags: string[]
  summary: string | null
  relevance: string | null
  editorial_idea: string | null
  importance: string | null
  editorial_angle: string | null
  inversus_link: string | null
  rating: number
  status: NewsStatus
  selected_for: NewsCategory | null
  created_at: string
  updated_at: string
}
