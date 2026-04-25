import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

// Subir PDF a Supabase Storage
export async function POST(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
  }

  const supabase = createServerClient()
  const ext = file.name.split('.').pop() || 'pdf'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from('articles')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('articles').getPublicUrl(path)

  return NextResponse.json({
    pdf_url: urlData.publicUrl,
    pdf_path: path,
  })
}
