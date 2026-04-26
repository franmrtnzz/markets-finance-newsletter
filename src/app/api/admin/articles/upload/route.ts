import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

function checkAdmin(request: NextRequest) {
  const session = request.cookies.get('admin_session')
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  return null
}

// Sube PDF o imagen de portada al bucket "articles"
export async function POST(request: NextRequest) {
  const denied = checkAdmin(request)
  if (denied) return denied

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const kind = (formData.get('kind') as string) || 'pdf' // 'pdf' | 'cover'

  if (!file) {
    return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 })
  }

  const supabase = createServerClient()
  const ext = file.name.split('.').pop() || (kind === 'cover' ? 'jpg' : 'pdf')
  const isImage = file.type.startsWith('image/')
  const folder = kind === 'cover' ? 'covers' : isImage ? 'images' : 'pdfs'
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const { error } = await supabase.storage
    .from('articles')
    .upload(path, file, { contentType: file.type, upsert: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('articles').getPublicUrl(path)

  if (kind === 'cover') {
    return NextResponse.json({ cover_url: urlData.publicUrl, cover_path: path })
  }
  return NextResponse.json({ pdf_url: urlData.publicUrl, pdf_path: path })
}
