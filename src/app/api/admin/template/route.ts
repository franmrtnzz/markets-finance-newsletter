import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase'

function isAuthed() {
  return cookies().get('admin_session')?.value === 'true'
}

// GET — devuelve el HTML guardado (lo almacenamos en una tabla settings key-value)
export async function GET() {
  if (!isAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const supabase = createServerClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'newsletter_template')
    .single()

  return NextResponse.json({ html: data?.value ?? '' })
}

// PUT — guarda el HTML del formato actual
export async function PUT(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { html } = await req.json()

  const supabase = createServerClient()
  const { error } = await supabase
    .from('settings')
    .upsert({ key: 'newsletter_template', value: html, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
