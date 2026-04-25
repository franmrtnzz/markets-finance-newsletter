import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdmin(request)
  if (denied) return denied
  const body = await request.json()
  if (body.status === 'published' && !body.published_at) {
    body.published_at = new Date().toISOString()
  }
  const supabase = createServerClient()
  const { data, error } = await supabase.from('notes').update(body).eq('id', params.id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const denied = checkAdmin(request)
  if (denied) return denied
  const supabase = createServerClient()
  const { error } = await supabase.from('notes').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
