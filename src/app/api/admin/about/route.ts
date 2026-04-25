import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@/lib/supabase'

function isAuthed() {
  return cookies().get('admin_session')?.value === 'true'
}

// GET — devuelve el contenido de "Sobre mí"
export async function GET() {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('settings')
    .select('value')
    .eq('key', 'about')
    .single()

  const defaults = {
    greeting: 'Hola, soy Fran 👋',
    photo: '/images/fran.jpg',
    bio: '',
    facts: [
      { emoji: '📍', label: 'Ubicación', value: 'España' },
      { emoji: '🎓', label: 'Estudios', value: '' },
      { emoji: '📈', label: 'Pasión', value: 'Mercados financieros' },
      { emoji: '💡', label: 'Intereses', value: 'Economía, tech' },
      { emoji: '✍️', label: 'Escribo', value: 'Cuando puedo' },
      { emoji: '☕', label: 'Fuel', value: 'Café' },
    ],
  }

  if (data?.value) {
    try {
      return NextResponse.json(JSON.parse(data.value))
    } catch {
      return NextResponse.json(defaults)
    }
  }
  return NextResponse.json(defaults)
}

// PUT — guarda el contenido (solo admin)
export async function PUT(req: NextRequest) {
  if (!isAuthed()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const supabase = createServerClient()

  const { error } = await supabase
    .from('settings')
    .upsert(
      { key: 'about', value: JSON.stringify(body), updated_at: new Date().toISOString() },
      { onConflict: 'key' }
    )

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
