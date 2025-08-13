import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

interface SendGridEvent {
  event: 'bounce' | 'spamreport' | 'unsubscribe' | 'dropped' | 'deferred'
  email: string
  timestamp: number
  sg_event_id: string
  sg_message_id: string
  reason?: string
}

export async function POST(request: NextRequest) {
  try {
    const events: SendGridEvent[] = await request.json()
    
    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: 'Invalid webhook data' }, { status: 400 })
    }

    const supabase = createServerClient()
    
    // Procesar cada evento
    for (const event of events) {
      const { event: eventType, email, timestamp, reason } = event
      
      console.log(`Processing SendGrid event: ${eventType} for ${email}`)
      
      // Buscar suscriptor por email
      const { data: subscriber, error: fetchError } = await supabase
        .from('subscribers')
        .select('id, status')
        .eq('email', email)
        .single()
      
      if (fetchError || !subscriber) {
        console.log(`Subscriber not found for email: ${email}`)
        continue
      }
      
      // Actualizar estado según el tipo de evento
      let newStatus = subscriber.status
      let updateData: any = {}
      
      switch (eventType) {
        case 'bounce':
        case 'dropped':
        case 'spamreport':
          newStatus = 'unsubscribed'
          updateData = {
            status: newStatus,
            unsubscribed_at: new Date(timestamp * 1000).toISOString(),
            bounce_reason: reason || 'Bounce from SendGrid'
          }
          break
          
        case 'unsubscribe':
          newStatus = 'unsubscribed'
          updateData = {
            status: newStatus,
            unsubscribed_at: new Date(timestamp * 1000).toISOString(),
            unsubscribed_via: 'sendgrid_webhook'
          }
          break
          
        default:
          console.log(`Unhandled event type: ${eventType}`)
          continue
      }
      
      // Actualizar suscriptor
      if (newStatus !== subscriber.status) {
        const { error: updateError } = await supabase
          .from('subscribers')
          .update(updateData)
          .eq('id', subscriber.id)
        
        if (updateError) {
          console.error(`Error updating subscriber ${subscriber.id}:`, updateError)
        } else {
          console.log(`Updated subscriber ${subscriber.id} status to ${newStatus}`)
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 