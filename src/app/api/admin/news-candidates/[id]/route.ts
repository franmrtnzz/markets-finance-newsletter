import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('news_candidates')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const body = await request.json()

  // Limpiar campos de texto
  if (body.title !== undefined) body.title = body.title?.trim() || null
  if (body.source !== undefined) body.source = body.source?.trim() || null
  if (body.url !== undefined) body.url = body.url?.trim() || null
  if (body.summary !== undefined) body.summary = body.summary?.trim() || null
  if (body.relevance !== undefined) body.relevance = body.relevance?.trim() || null
  if (body.editorial_idea !== undefined) body.editorial_idea = body.editorial_idea?.trim() || null
  if (body.importance !== undefined) body.importance = body.importance?.trim() || null
  if (body.editorial_angle !== undefined) body.editorial_angle = body.editorial_angle?.trim() || null
  if (body.inversus_link !== undefined) body.inversus_link = body.inversus_link?.trim() || null

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('news_candidates')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const supabase = createServerClient()
  const { error } = await supabase.from('news_candidates').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
