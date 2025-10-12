import sgMail from '@sendgrid/mail'

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (emailData: EmailData) => {
  const msg = {
    to: emailData.to,
    from: {
      email: process.env.SENDGRID_FROM_EMAIL!,
      name: process.env.SENDGRID_FROM_NAME || 'Markets & Finance'
    },
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.SENDGRID_FROM_EMAIL}?subject=unsubscribe>, <${process.env.BASE_URL}/unsubscribe>`
    }
  }

  try {
    console.log(`📧 Enviando a: ${emailData.to}`)
    const response = await sgMail.send(msg)
    console.log(`✅ Email enviado exitosamente a ${emailData.to}`)
    return { success: true, messageId: response[0]?.headers?.['x-message-id'] }
  } catch (error: any) {
    console.error(`❌ Error SendGrid para ${emailData.to}:`, error.response?.body || error.message)
    return { 
      success: false, 
      error: error.response?.body?.errors?.[0]?.message || error.message,
      email: emailData.to
    }
  }
}

export const sendBulkEmails = async (emails: EmailData[]) => {
  const batchSize = 90 // Stay under 100/day limit
  const results = []

  console.log(`📧 Iniciando envío masivo de ${emails.length} emails en lotes de ${batchSize}`)

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    console.log(`📧 Procesando lote ${Math.floor(i/batchSize) + 1}: emails ${i+1}-${Math.min(i+batchSize, emails.length)}`)
    
    try {
      const batchResults = await Promise.all(batch.map(async (email, index) => {
        try {
          const result = await sendEmail(email)
          console.log(`📧 Email ${i + index + 1}/${emails.length} (${email.to}): ${result.success ? '✅ Enviado' : '❌ Error'}`)
          return result
        } catch (error) {
          console.error(`❌ Error enviando a ${email.to}:`, error)
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
        }
      }))
      
      results.push(...batchResults)
      
      // Rate limiting: wait 1 minute between batches
      if (i + batchSize < emails.length) {
        console.log('⏳ Esperando 60 segundos antes del siguiente lote...')
        await new Promise(resolve => setTimeout(resolve, 60000))
      }
    } catch (error) {
      console.error(`❌ Error en lote ${Math.floor(i/batchSize) + 1}:`, error)
      results.push(...batch.map(() => ({ success: false, error: 'Batch failed' })))
    }
  }

  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  console.log(`📧 Envío completado: ${successCount} exitosos, ${failCount} fallidos`)

  return results
} 