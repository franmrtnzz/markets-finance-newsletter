import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// GET: contar likes y comprobar si el fingerprint actual ya dio like
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const contentType = searchParams.get('type')
  const contentId = searchParams.get('id')
  const fingerprint = searchParams.get('fp')

  if (!contentType || !contentId) {
    return NextResponse.json({ error: 'type e id requeridos' }, { status: 400 })
  }

  const supabase = createServerClient()

  const { count } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('content_type', contentType)
    .eq('content_id', contentId)

  let liked = false
  if (fingerprint) {
    const { data } = await supabase
      .from('likes')
      .select('id')
      .eq('content_type', contentType)
      .eq('content_id', contentId)
      .eq('fingerprint', fingerprint)
      .maybeSingle()
    liked = !!data
  }

  return NextResponse.json({ count: count ?? 0, liked })
}

// POST: toggle like (dar o quitar)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { content_type, content_id, fingerprint } = body

  if (!content_type || !content_id || !fingerprint) {
    return NextResponse.json({ error: 'content_type, content_id y fingerprint requeridos' }, { status: 400 })
  }

  const supabase = createServerClient()

  // Check if already liked
  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('content_type', content_type)
    .eq('content_id', content_id)
    .eq('fingerprint', fingerprint)
    .maybeSingle()

  if (existing) {
    // Unlike
    await supabase.from('likes').delete().eq('id', existing.id)
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', content_type)
      .eq('content_id', content_id)
    return NextResponse.json({ liked: false, count: count ?? 0 })
  } else {
    // Like
    await supabase.from('likes').insert({ content_type, content_id, fingerprint })
    const { count } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('content_type', content_type)
      .eq('content_id', content_id)
    return NextResponse.json({ liked: true, count: count ?? 0 })
  }
}
