import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token de baja requerido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find active subscriber
    const { data: subscribers, error: fetchError } = await supabase
      .from('subscribers')
      .select('id, token_hash, email')
      .eq('status', 'active')

    if (fetchError) throw fetchError

    // Find the subscriber with matching token
    let subscriberId: string | null = null

    for (const subscriber of subscribers || []) {
      if (await bcrypt.compare(token, subscriber.token_hash)) {
        subscriberId = subscriber.id
        break
      }
    }

    if (!subscriberId) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }

    // Unsubscribe the user
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        status: 'unsubscribed',
        unsubscribed_at: new Date().toISOString(),
        token_hash: null // Clear the token
      })
      .eq('id', subscriberId)

    if (updateError) throw updateError

    // Redirect to unsubscribe confirmation page
    const confirmationUrl = `${process.env.BASE_URL}/?unsubscribed=true`
    return NextResponse.redirect(confirmationUrl)

  } catch (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 