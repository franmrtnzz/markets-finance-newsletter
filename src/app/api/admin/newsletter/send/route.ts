import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'
import { sendBulkEmails } from '@/lib/sendgrid'

export async function POST(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { title, preheader, content } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ error: 'Título y contenido son requeridos' }, { status: 400 })
    }

    const supabase = createServerClient()

    // 1. Obtener todos los suscriptores activos
    const { data: subscribers, error: subscribersError } = await supabase
      .from('subscribers')
      .select('id, email, unsubscribe_token')
      .eq('is_active', true)

    if (subscribersError) {
      console.error('Error fetching subscribers:', subscribersError)
      return NextResponse.json({ error: 'Error al obtener suscriptores' }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ error: 'No hay suscriptores activos' }, { status: 400 })
    }

    // 2. Crear el newsletter en la base de datos
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .insert({
        title,
        preheader,
        content_md: content,
        status: 'sent',
        sent_at: new Date().toISOString()
      })
      .select('id')
      .single()

    if (issueError) {
      console.error('Error creating issue:', issueError)
      return NextResponse.json({ error: 'Error al crear newsletter' }, { status: 500 })
    }

    // 3. Preparar emails para envío
    const emails = subscribers.map(subscriber => ({
      to: subscriber.email,
      subject: title,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #2c3e50; margin: 0;">Markets & Finance</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">${preheader || 'Newsletter semanal'}</p>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ${content}
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 14px;">
            <p>Para darte de baja, haz clic <a href="${process.env.BASE_URL || 'http://localhost:3000'}/unsubscribe/${subscriber.unsubscribe_token}">aquí</a></p>
          </div>
        </body>
        </html>
      `
    }))

    // 4. Enviar emails (simplificado)
    try {
      await sendBulkEmails(emails)
    } catch (sendError) {
      // Si falla el envío, eliminar el newsletter creado
      await supabase.from('issues').delete().eq('id', issue.id)
      console.error('Error sending emails:', sendError)
      return NextResponse.json({ error: 'Error al enviar emails' }, { status: 500 })
    }

    // 5. Registrar envíos en la base de datos
    const sendsData = subscribers.map(subscriber => ({
      issue_id: issue.id,
      subscriber_id: subscriber.id,
      status: 'sent',
      provider_message_id: `send_${Date.now()}_${subscriber.id}`,
      updated_at: new Date().toISOString()
    }))

    const { error: sendsError } = await supabase
      .from('sends')
      .insert(sendsData)

    if (sendsError) {
      console.error('Error recording sends:', sendsError)
      // No fallamos si solo falla el registro
    }

    return NextResponse.json({ 
      success: true,
      message: `Newsletter enviado exitosamente a ${subscribers.length} suscriptores`,
      issueId: issue.id,
      sentCount: subscribers.length
    })

  } catch (error) {
    console.error('Error inesperado:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
} 