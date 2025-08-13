import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Token de confirmación requerido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Find subscriber with pending status
    const { data: subscribers, error: fetchError } = await supabase
      .from('subscribers')
      .select('id, token_hash, email')
      .eq('status', 'pending')

    if (fetchError) throw fetchError

    // Find the subscriber with matching token
    let subscriberId: string | null = null
    let subscriberEmail: string | null = null

    for (const subscriber of subscribers || []) {
      if (await bcrypt.compare(token, subscriber.token_hash)) {
        subscriberId = subscriber.id
        subscriberEmail = subscriber.email
        break
      }
    }

    if (!subscriberId) {
      return NextResponse.json({ error: 'Token inválido o expirado' }, { status: 400 })
    }

    // Activate subscriber
    const { error: updateError } = await supabase
      .from('subscribers')
      .update({ 
        status: 'active',
        token_hash: null // Clear the token
      })
      .eq('id', subscriberId)

    if (updateError) throw updateError

    // Redirect to success page
    const successUrl = `${process.env.BASE_URL}/?confirmed=true`
    return NextResponse.redirect(successUrl)

  } catch (error) {
    console.error('Confirmation error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 