import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, honeypot } = await request.json()
    console.log('Subscription request received for email:', email)

    // Validación básica
    if (!email || typeof email !== 'string') {
      console.log('Invalid email format')
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log('Email format validation failed')
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    // Honeypot check (anti-spam)
    if (honeypot) {
      console.log('Honeypot triggered')
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
    }

    const supabase = createServerClient()
    console.log('Supabase client created, checking existing subscription...')

    // Verificar si ya existe
    const { data: existing, error: checkError } = await supabase
      .from('subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking existing subscription:', checkError)
      return NextResponse.json({ error: 'Error al verificar suscripción existente' }, { status: 500 })
    }

    if (existing) {
      console.log('Existing subscriber found:', existing)
      if (existing.is_active) {
        console.log('Subscriber already active')
        return NextResponse.json({ 
          message: 'Ya estás suscrito a nuestra newsletter',
          alreadySubscribed: true 
        })
      } else {
        // Reactivar suscripción
        console.log('Reactivating inactive subscription...')
        const { error: updateError } = await supabase
          .from('subscribers')
          .update({ 
            is_active: true, 
            subscribed_at: new Date().toISOString(),
            unsubscribe_token: crypto.randomUUID()
          })
          .eq('id', existing.id)

        if (updateError) {
          console.error('Error reactivando suscripción:', updateError)
          return NextResponse.json({ error: 'Error al reactivar suscripción' }, { status: 500 })
        }

        console.log('Subscription reactivated successfully')
        return NextResponse.json({ 
          message: '¡Bienvenido de vuelta! Tu suscripción ha sido reactivada',
          reactivated: true 
        })
      }
    }

    // Crear nueva suscripción
    console.log('Creating new subscription...')
    const { data: newSubscriber, error: insertError } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase(),
        unsubscribe_token: crypto.randomUUID()
      })
      .select()

    if (insertError) {
      console.error('Error creando suscripción:', insertError)
      return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 })
    }

    console.log('New subscription created successfully:', newSubscriber)
    return NextResponse.json({ 
      message: '¡Te has suscrito exitosamente a Markets & Finance!',
      success: true 
    })

  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 