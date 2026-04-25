import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

// Listar todas las newsletters (admin: incluye drafts)
export async function GET(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('newsletters')
    .select('id, slug, title, excerpt, status, published_at, created_at, updated_at')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ newsletters: data ?? [] })
}

// Crear newsletter
export async function POST(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const body = await request.json()
  const { slug, title, excerpt, html, status } = body

  if (!slug || !title || !html) {
    return NextResponse.json({ error: 'slug, title y html son requeridos' }, { status: 400 })
  }

  const supabase = createServerClient()
  const publishedAt = status === 'published' ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('newsletters')
    .insert({ slug, title, excerpt: excerpt || null, html, status: status || 'draft', published_at: publishedAt })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
