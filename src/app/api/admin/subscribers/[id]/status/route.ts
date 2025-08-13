import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación admin
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id } = params
    const { status } = await request.json()

    // Validar estado
    if (!['pending', 'active', 'unsubscribed'].includes(status)) {
      return NextResponse.json({ error: 'Estado inválido' }, { status: 400 })
    }

    const supabase = createServerClient()

    // Actualizar estado del suscriptor
    const updateData: any = { status }
    
    if (status === 'active') {
      updateData.confirmed_at = new Date().toISOString()
    } else if (status === 'unsubscribed') {
      updateData.unsubscribed_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('subscribers')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating subscriber status:', error)
      return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 