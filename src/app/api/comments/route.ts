import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

// GET: listar comentarios visibles para un contenido
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get('type')
  const contentId = searchParams.get('id')

  if (!contentType || !contentId) {
    return NextResponse.json({ error: 'type e id requeridos' }, { status: 400 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .eq('status', 'visible')
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ comments: data ?? [] })
}

// POST: crear comentario (requiere access_token de Supabase Auth en el body)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { content_type, content_id, text, access_token } = body

  if (!content_type || !content_id || !text?.trim() || !access_token) {
    return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
  }

  // Verificar el token del usuario
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${access_token}` } },
  })

  const { data: { user }, error: authError } = await userClient.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('comments')
    .insert({
      content_type,
      content_id,
      user_id: user.id,
      author_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Anónimo',
      author_avatar: user.user_metadata?.avatar_url || null,
      body: text.trim(),
      status: 'visible',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
