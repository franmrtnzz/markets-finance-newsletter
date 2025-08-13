import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { email, honeypot } = await request.json()

    // Validación básica
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Formato de email inválido' }, { status: 400 })
    }

    // Honeypot check (anti-spam)
    if (honeypot) {
      return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Verificar si ya existe
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id, is_active')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      if (existing.is_active) {
        return NextResponse.json({ 
          message: 'Ya estás suscrito a nuestra newsletter',
          alreadySubscribed: true 
        })
      } else {
        // Reactivar suscripción
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

        return NextResponse.json({ 
          message: '¡Bienvenido de vuelta! Tu suscripción ha sido reactivada',
          reactivated: true 
        })
      }
    }

    // Crear nueva suscripción
    const { error: insertError } = await supabase
      .from('subscribers')
      .insert({
        email: email.toLowerCase(),
        unsubscribe_token: crypto.randomUUID()
      })

    if (insertError) {
      console.error('Error creando suscripción:', insertError)
      return NextResponse.json({ error: 'Error al crear suscripción' }, { status: 500 })
    }

    return NextResponse.json({ 
      message: '¡Te has suscrito exitosamente a Markets & Finance!',
      success: true 
    })

  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 