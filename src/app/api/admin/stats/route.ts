import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Check admin session
    const cookieStore = cookies()
    const adminSession = cookieStore.get('admin_session')
    
    if (!adminSession || adminSession.value !== 'authenticated') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get subscriber stats
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('status')

    if (subscribersError) throw subscribersError

    // Get issue stats
    const { data: issues, error: issuesError } = await supabase
      .from('issues')
      .select('status')

    if (issuesError) throw issuesError

    // Calculate stats
    const totalSubscribers = subscribers?.length || 0
    const activeSubscribers = subscribers?.filter(s => s.status === 'active').length || 0
    const pendingSubscribers = subscribers?.filter(s => s.status === 'pending').length || 0

    const totalIssues = issues?.length || 0
    const draftIssues = issues?.filter(i => i.status === 'draft').length || 0
    const scheduledIssues = issues?.filter(i => i.status === 'scheduled').length || 0
    const sentIssues = issues?.filter(i => i.status === 'sent').length || 0

    return NextResponse.json({
      totalSubscribers,
      activeSubscribers,
      pendingSubscribers,
      totalIssues,
      draftIssues,
      scheduledIssues,
      sentIssues
    })

  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 