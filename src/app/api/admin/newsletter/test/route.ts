import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/mailerlite'

/**
 * Endpoint de prueba para enviar un newsletter solo a un email específico
 * Útil para probar sin afectar a los suscriptores reales
 * 
 * POST /api/admin/newsletter/test
 * Body: {
 *   title: string
 *   preheader?: string
 *   content: string (HTML)
 *   testEmail: string (opcional, por defecto usa el email del admin)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const adminSession = request.cookies.get('admin_session')
    if (!adminSession) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { title, preheader, content, testEmail } = await request.json()

    if (!title || !content) {
      return NextResponse.json({ 
        error: 'Título y contenido son requeridos' 
      }, { status: 400 })
    }

    // Email de prueba (por defecto el del admin, o el especificado)
    const emailToSend = testEmail || 'francervantesmartinez2004@gmail.com'

    // Preparar HTML del newsletter de prueba
    const newsletterHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ffc107;">
          <p style="margin: 0; color: #856404; font-weight: bold;">
            🧪 EMAIL DE PRUEBA - Este es un test de la integración con MailerLite
          </p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #2c3e50; margin: 0;">Markets & Finance</h1>
          <p style="color: #7f8c8d; margin: 10px 0 0 0;">${preheader || 'Newsletter semanal'}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          ${content}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding: 20px; color: #7f8c8d; font-size: 14px; border-top: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0; font-size: 12px; color: #999;">
            Este es un email de prueba. Los suscriptores reales no recibirán este email.
          </p>
          <p style="margin: 10px 0 0 0; font-size: 12px;">
            Markets & Finance Newsletter
          </p>
        </div>
      </body>
      </html>
    `

    // Enviar email de prueba usando sendEmail con grupo temporal
    // Esto asegura que solo se envíe a este email, no a todos los suscriptores
    console.log(`🧪 Enviando email de prueba a: ${emailToSend}`)
    console.log(`📧 Asunto: ${title}`)
    
    const result = await sendEmail({
      to: emailToSend,
      subject: `[PRUEBA] ${title}`,
      html: newsletterHtml,
      text: content.replace(/<[^>]*>/g, '') // Versión de texto plano
    }, true) // true = usar grupo temporal (solo para este email)

    if (!result.success) {
      console.error('❌ Error enviando email de prueba:', result.error)
      return NextResponse.json({ 
        success: false,
        error: result.error || 'Error al enviar email de prueba',
        details: result
      }, { status: 500 })
    }

    console.log(`✅ Email de prueba enviado exitosamente a ${emailToSend}`)
    console.log(`📧 Message ID: ${result.messageId}`)

    return NextResponse.json({ 
      success: true,
      message: `Email de prueba enviado exitosamente a ${emailToSend}`,
      messageId: result.messageId,
      recipient: emailToSend,
      note: 'Este fue un email de prueba. Los suscriptores reales no fueron afectados.'
    })

  } catch (error) {
    console.error('❌ Error en endpoint de prueba:', error)
    return NextResponse.json({ 
      error: 'Error interno del servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

