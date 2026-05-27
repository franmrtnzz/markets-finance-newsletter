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
  const { searchParams } = new URL(request.url)

  let query = supabase.from('news_candidates').select('*')

  // Filtros opcionales
  const category = searchParams.get('category')
  if (category) query = query.eq('category', category)

  const status = searchParams.get('status')
  if (status) query = query.eq('status', status)

  const quarter = searchParams.get('quarter')
  if (quarter) query = query.eq('quarter', quarter)

  const scope = searchParams.get('scope')
  if (scope) query = query.eq('scope', scope)

  const tag = searchParams.get('tag')
  if (tag) query = query.contains('tags', [tag])

  const search = searchParams.get('search')
  if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%,source.ilike.%${search}%`)

  query = query.order('saved_at', { ascending: false })

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ news: data ?? [] })
}

export async function POST(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const body = await request.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'El título es requerido' }, { status: 400 })
  }
  if (!body.quarter?.trim()) {
    return NextResponse.json({ error: 'El cuatrimestre es requerido' }, { status: 400 })
  }

  const supabase = createServerClient()

  const record = {
    title: body.title.trim(),
    source: body.source?.trim() || null,
    url: body.url?.trim() || null,
    published_date: body.published_date || null,
    category: body.category || 'economia_general',
    scope: body.scope || 'global',
    quarter: body.quarter.trim(),
    tags: body.tags || [],
    summary: body.summary?.trim() || null,
    relevance: body.relevance?.trim() || null,
    editorial_idea: body.editorial_idea?.trim() || null,
    importance: body.importance?.trim() || null,
    editorial_angle: body.editorial_angle?.trim() || null,
    inversus_link: body.inversus_link?.trim() || null,
    rating: body.rating || 0,
    status: body.status || 'pendiente',
    selected_for: body.selected_for || null,
  }

  const { data, error } = await supabase
    .from('news_candidates')
    .insert(record)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
