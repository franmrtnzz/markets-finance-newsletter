import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { sendBulkEmails } from '@/lib/mailerlite'
import { compileNewsletterTemplate } from '@/lib/mjml'

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

    // Get all active subscribers
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('id, email')
      .eq('status', 'active')

    if (subscribersError) throw subscribersError

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No hay suscriptores activos' }, { status: 400 })
    }

    // Compile newsletter HTML if not already compiled
    let newsletterHtml = issue.html
    if (!newsletterHtml && issue.content_md) {
      newsletterHtml = compileNewsletterTemplate({
        title: issue.title,
        preheader: issue.preheader || '',
        content: issue.content_md,
        issueUrl: `${process.env.BASE_URL}/issues/${issue.slug}`,
        unsubscribeUrl: `${process.env.BASE_URL}/unsubscribe?token=unsub`
      })
    }

    // Prepare emails for sending
    const emails = subscribers.map(subscriber => ({
      to: subscriber.email,
      subject: issue.title,
      html: newsletterHtml
    }))

    // Send emails in batches
    const sendResults = await sendBulkEmails(emails)

    // Count successful sends
    const successfulSends = sendResults.filter(result => result.success).length
    const failedSends = sendResults.length - successfulSends

    // If all sends failed, do not mark issue as sent and return error
    if (successfulSends === 0) {
      console.error(`❌ Todos los envíos fallaron para issue ${issueId}. Detalles:`, sendResults)
      return NextResponse.json({ error: 'No se pudieron enviar los emails. Revisa los logs y MailerLite.', details: sendResults }, { status: 500 })
    }

    // Create send records
    const sendRecords = subscribers.map((subscriber, index) => ({
      issue_id: issueId,
      subscriber_id: subscriber.id,
      status: sendResults[index]?.success ? 'sent' : 'failed',
      provider_message_id: sendResults[index]?.success ? `msg_${Date.now()}_${index}` : null
    }))

    // Insert send records
    const { error: sendsError } = await supabase
      .from('sends')
      .insert(sendRecords)

    if (sendsError) throw sendsError

    // Update issue status
    const { error: updateError } = await supabase
      .from('issues')
      .update({ 
        status: 'sent',
        sent_at: new Date().toISOString(),
        html: newsletterHtml
      })
      .eq('id', issueId)

    if (updateError) throw updateError

    // Update subscriber last_sent_at
    const { error: subscriberUpdateError } = await supabase
      .from('subscribers')
      .update({ last_sent_at: new Date().toISOString() })
      .in('id', subscribers.map(s => s.id))

    if (subscriberUpdateError) throw subscriberUpdateError

    return NextResponse.json({
      message: 'Newsletter enviado exitosamente',
      totalSubscribers: subscribers.length,
      successfulSends,
      failedSends
    })

  } catch (error) {
    console.error('Send newsletter error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 