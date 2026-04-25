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
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notes: data ?? [] })
}

export async function POST(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const body = await request.json()
  const { body: noteBody, status } = body

  if (!noteBody?.trim()) {
    return NextResponse.json({ error: 'El texto es requerido' }, { status: 400 })
  }

  const supabase = createServerClient()
  const publishedAt = status === 'published' ? new Date().toISOString() : null

  const { data, error } = await supabase
    .from('notes')
    .insert({ body: noteBody.trim(), status: status || 'draft', published_at: publishedAt })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
