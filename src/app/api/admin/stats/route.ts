import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession) {
      console.log('No admin session found')
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    console.log('Admin session found, fetching stats...')
    const supabase = createServerClient()

    // Obtener estadísticas de suscriptores
    console.log('Fetching subscribers...')
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('is_active')

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json({ error: 'Error al obtener suscriptores' }, { status: 500 })
    }

    console.log('Subscribers fetched:', subscribers?.length || 0)

    // Obtener estadísticas de newsletters
    console.log('Fetching issues...')
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('status')

    if (issuesError) {
      console.error('Error fetching issues:', issuesError)
      return NextResponse.json({ error: 'Error al obtener newsletters' }, { status: 500 })
    }

    console.log('Issues fetched:', issues?.length || 0)

    // Calcular estadísticas
    const totalSubscribers = subscribers?.length || 0
    const activeSubscribers = subscribers?.filter(s => s.is_active).length || 0
    const inactiveSubscribers = totalSubscribers - activeSubscribers

    const totalIssues = issues?.length || 0
    const draftIssues = issues?.filter(i => i.status === 'draft').length || 0
    const scheduledIssues = issues?.filter(i => i.status === 'scheduled').length || 0
    const sentIssues = issues?.filter(i => i.status === 'sent').length || 0

    const stats = {
      subscribers: {
        total: totalSubscribers,
        active: activeSubscribers,
        inactive: inactiveSubscribers
      },
      issues: {
        total: totalIssues,
        draft: draftIssues,
        scheduled: scheduledIssues,
        sent: sentIssues
      }
    }

    console.log('Stats calculated:', stats)
    return NextResponse.json(stats)

  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 