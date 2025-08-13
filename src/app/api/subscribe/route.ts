import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/sendgrid'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, website } = body

    // Honeypot check
    if (website) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Basic email validation
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    // Rate limiting (simple in-memory for demo, use Redis in production)
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitKey = `subscribe:${clientIP}`
    
    // Check if IP has made too many requests recently
    // This is a simplified version - in production use Redis or similar
    
    const supabase = createServerClient()

    // Check if email already exists
    const { data: existingSubscriber } = await supabase
      .from('subscribers')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single()

    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return NextResponse.json({ error: 'Ya estás suscrito' }, { status: 400 })
      }
      
      if (existingSubscriber.status === 'pending') {
        return NextResponse.json({ error: 'Revisa tu email para confirmar la suscripción' }, { status: 400 })
      }
    }

    // Generate confirmation token
    const token = uuidv4()
    const tokenHash = await bcrypt.hash(token, 10)

    // Create or update subscriber
    const subscriberData = {
      email: email.toLowerCase(),
      status: 'pending',
      token_hash: tokenHash,
      source: 'web_form',
      consent_ts: new Date().toISOString()
    }

    let subscriberId: string

    if (existingSubscriber) {
      // Update existing subscriber
      const { data, error } = await supabase
        .from('subscribers')
        .update(subscriberData)
        .eq('id', existingSubscriber.id)
        .select('id')
        .single()

      if (error) throw error
      subscriberId = data.id
    } else {
      // Create new subscriber
      const { data, error } = await supabase
        .from('subscribers')
        .insert(subscriberData)
        .select('id')
        .single()

      if (error) throw error
      subscriberId = data.id
    }

    // Send confirmation email
    const confirmationUrl = `${process.env.BASE_URL}/confirm?token=${token}`
    
    const emailResult = await sendEmail({
      to: email,
      subject: 'Confirma tu suscripción - Markets & Finance',
      html: `
        <h2>¡Bienvenido a Markets & Finance!</h2>
        <p>Para confirmar tu suscripción, haz clic en el siguiente enlace:</p>
        <p><a href="${confirmationUrl}">Confirmar suscripción</a></p>
        <p>Si no solicitaste esta suscripción, puedes ignorar este email.</p>
      `
    })

    if (!emailResult.success) {
      // Delete the subscriber if email fails
      await supabase
        .from('subscribers')
        .delete()
        .eq('id', subscriberId)
      
      return NextResponse.json({ error: 'Error al enviar email de confirmación' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Suscripción creada. Revisa tu email para confirmar.' 
    })

  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 