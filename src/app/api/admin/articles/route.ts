import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function GET(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('articles')
    .select('id, slug, title, excerpt, tags, pdf_url, cover_url, status, published_at, created_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ articles: data ?? [] })
}

export async function POST(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const body = await request.json()
  const { slug, title, excerpt, description, pdf_url, pdf_path, cover_url, tags, status } = body

  if (!slug || !title) {
    return NextResponse.json({ error: 'slug y title son requeridos' }, { status: 400 })
  }

  const supabase = createServerClient()
  const publishedAt = status === 'published' ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('articles')
    .insert({
      slug, title,
      excerpt: excerpt || null,
      description: description || null,
      pdf_url: pdf_url || null,
      pdf_path: pdf_path || null,
      cover_url: cover_url || null,
      tags: tags || [],
      status: status || 'draft',
      published_at: publishedAt,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
