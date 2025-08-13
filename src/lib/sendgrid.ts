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
      name: process.env.SENDGRID_FROM_NAME!
    },
    subject: emailData.subject,
    html: emailData.html,
    text: emailData.text || emailData.html.replace(/<[^>]*>/g, ''),
    headers: {
      'List-Unsubscribe': `<mailto:${process.env.SENDGRID_FROM_EMAIL}?subject=unsubscribe>, <${process.env.BASE_URL}/unsubscribe>`
    }
  }

  try {
    await sgMail.send(msg)
    return { success: true }
  } catch (error: any) {
    console.error('SendGrid error:', error)
    return { 
      success: false, 
      error: error.response?.body?.errors?.[0]?.message || error.message 
    }
  }
}

export const sendBulkEmails = async (emails: EmailData[]) => {
  const batchSize = 90 // Stay under 100/day limit
  const results = []

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize)
    
    try {
      await Promise.all(batch.map(email => sendEmail(email)))
      results.push(...batch.map(() => ({ success: true })))
      
      // Rate limiting: wait 1 minute between batches
      if (i + batchSize < emails.length) {
        await new Promise(resolve => setTimeout(resolve, 60000))
      }
    } catch (error) {
      results.push(...batch.map(() => ({ success: false, error: 'Batch failed' })))
    }
  }

  return results
} 