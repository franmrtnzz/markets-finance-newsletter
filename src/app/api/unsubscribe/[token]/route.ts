import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token requerido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Buscar suscriptor por token
    const { data: subscriber, error: findError } = await supabase
      .from('subscribers')
      .select('id, email')
      .eq('unsubscribe_token', token)
      .single()

    if (findError || !subscriber) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }

    // Desactivar suscripción
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        is_active: false,
        unsubscribe_token: crypto.randomUUID() // Generar nuevo token
      })
      .eq('id', subscriber.id)

    if (updateError) {
      console.error('Error desactivando suscripción:', updateError)
      return NextResponse.json({ error: 'Error al desactivar suscripción' }, { status: 500 })
    }

    // Redirigir a página de confirmación
    const redirectUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/unsubscribe-success?email=${encodeURIComponent(subscriber.email)}`
    
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 