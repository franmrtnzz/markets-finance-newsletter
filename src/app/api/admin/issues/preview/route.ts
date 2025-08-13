import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { compileNewsletterTemplate } from '@/lib/mjml'

export async function POST(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await request.json()
    const { title, preheader, content } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 })
    }

    // Compile newsletter template
    const html = compileNewsletterTemplate({
      title: title,
      preheader: preheader || '',
      content: content,
      issueUrl: `${process.env.BASE_URL}/issues/preview`,
      unsubscribeUrl: `${process.env.BASE_URL}/unsubscribe?token=preview`
    })

    return NextResponse.json({ html })

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 