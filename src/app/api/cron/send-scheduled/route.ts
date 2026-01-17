import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendBulkEmails } from '@/lib/mailerlite'
import { compileNewsletterTemplate } from '@/lib/mjml'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a Vercel cron job
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const supabase = createServerClient()

    // Get all scheduled issues that are due to be sent
    const now = new Date().toISOString()
    const { data: scheduledIssues, error: issuesError } = await supabase
      .from('issues')
      .select('*')
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)

    if (issuesError) throw issuesError

    if (!scheduledIssues || scheduledIssues.length === 0) {
      return NextResponse.json({ 
        message: 'No hay newsletters programados para enviar',
        timestamp: now
      })
    }

    const results = []

    for (const issue of scheduledIssues) {
      try {
        // Get all active subscribers
        const { data: subscribers, error: subscribersError } = await supabase
          .from('subscribers')
          .select('id, email')
          .eq('status', 'active')

        if (subscribersError) throw subscribersError

        if (!subscribers || subscribers.length === 0) {
          results.push({
            issueId: issue.id,
            status: 'skipped',
            reason: 'No hay suscriptores activos'
          })
          continue
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

        if (successfulSends === 0) {
          console.error(`❌ Todos los envíos fallaron para issue ${issue.id}. Detalles:`, sendResults)
          results.push({
            issueId: issue.id,
            status: 'error',
            error: 'No se pudieron enviar los emails (todas las llamadas a MailerLite fallaron)',
            details: sendResults
          })
          // Skip DB updates for this issue
          continue
        }

        // Create send records
        const sendRecords = subscribers.map((subscriber, index) => ({
          issue_id: issue.id,
          subscriber_id: subscriber.id,
          status: sendResults[index]?.success ? 'sent' : 'failed',
          provider_message_id: sendResults[index]?.success ? `cron_${Date.now()}_${index}` : null
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
          .eq('id', issue.id)

        if (updateError) throw updateError

        // Update subscriber last_sent_at
        const { error: subscriberUpdateError } = await supabase
          .from('subscribers')
          .update({ last_sent_at: new Date().toISOString() })
          .in('id', subscribers.map(s => s.id))

        if (subscriberUpdateError) throw subscriberUpdateError

        results.push({
          issueId: issue.id,
          status: 'success',
          totalSubscribers: subscribers.length,
          successfulSends,
          failedSends
        })

      } catch (error) {
        console.error(`Error processing issue ${issue.id}:`, error)
        results.push({
          issueId: issue.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: 'Cron job completado',
      timestamp: now,
      totalIssues: scheduledIssues.length,
      results
    })

  } catch (error) {
    console.error('Cron job error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 