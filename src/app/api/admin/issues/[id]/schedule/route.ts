import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const issueId = params.id
    const body = await request.json()
    const { scheduled_at } = body

    if (!scheduled_at) {
      return NextResponse.json({ error: 'Fecha de programación requerida' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Get the issue
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single()

    if (issueError || !issue) {
      return NextResponse.json({ error: 'Newsletter no encontrado' }, { status: 404 })
    }

    if (issue.status === 'sent') {
      return NextResponse.json({ error: 'Este newsletter ya fue enviado' }, { status: 400 })
    }

    // Update issue status to scheduled
    const { error: updateError } = await supabase
      .from('issues')
      .update({ 
        status: 'scheduled',
        scheduled_at: scheduled_at
      })
      .eq('id', issueId)

    if (updateError) throw updateError

    return NextResponse.json({
      message: 'Newsletter programado exitosamente',
      scheduled_at: scheduled_at
    })

  } catch (error) {
    console.error('Schedule newsletter error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 