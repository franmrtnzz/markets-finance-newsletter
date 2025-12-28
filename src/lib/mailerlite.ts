// MailerLite API integration for sending emails
// Documentation: https://developers.mailerlite.com/
// 
// IMPORTANT: MailerLite uses campaigns for sending emails to groups of subscribers.
// This implementation creates campaigns and sends them to subscribers.

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface MailerLiteResponse {
  success: boolean
  messageId?: string
  error?: string
  email?: string
}

/**
 * Add a subscriber to MailerLite (if not already exists)
 */
const ensureSubscriber = async (email: string, apiKey: string, groupId?: string): Promise<boolean> => {
  try {
    const url = 'https://connect.mailerlite.com/api/subscribers'
    
    const payload: any = {
      email: email.toLowerCase(),
      status: 'active'
    }
    
    if (groupId) {
      payload.groups = [groupId]
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    // 201 Created or 200 OK means subscriber was added/updated
    // 409 Conflict means subscriber already exists, which is fine
    if (response.status === 201 || response.status === 200 || response.status === 409) {
      return true
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.warn(`⚠️ Error asegurando suscriptor ${email}: HTTP ${response.status} - ${errorText}`)
    }

    return response.ok
  } catch (error) {
    console.warn(`⚠️ Error asegurando suscriptor ${email} en MailerLite:`, error)
    return false
  }
}

/**
 * Send a single email using MailerLite
 * 
 * NOTE: MailerLite is designed for marketing campaigns, not transactional emails.
 * For individual emails (like tests), this creates a temporary group with only
 * the recipient, creates a campaign, sends it, and cleans up.
 * 
 * @param emailData Email data to send
 * @param useTemporaryGroup If true, creates a temporary group (for tests). If false, uses the configured group (for production).
 */
export const sendEmail = async (emailData: EmailData, useTemporaryGroup: boolean = false): Promise<MailerLiteResponse> => {
  const apiKey = process.env.MAILERLITE_API_KEY
  const fromEmail = process.env.MAILERLITE_FROM_EMAIL
  const fromName = process.env.MAILERLITE_FROM_NAME || 'Markets & Finance'
  const defaultGroupId = process.env.MAILERLITE_GROUP_ID

  if (!apiKey) {
    console.error('❌ MAILERLITE_API_KEY no está configurada')
    return {
      success: false,
      error: 'MailerLite API key no configurada',
      email: emailData.to
    }
  }

  if (!fromEmail) {
    console.error('❌ MAILERLITE_FROM_EMAIL no está configurada')
    return {
      success: false,
      error: 'MailerLite from email no configurada',
      email: emailData.to
    }
  }

  let tempGroupId: string | null = null

  try {
    console.log(`📧 Enviando email individual a: ${emailData.to}`)
    
    // For single emails, use sendBulkEmails with a temporary group if needed
    // This reuses the working code path
    let originalGroupId = process.env.MAILERLITE_GROUP_ID
    
    if (useTemporaryGroup) {
      console.log(`🧪 Creando grupo temporal para email de prueba...`)
      const tempGroupName = `Test-${Date.now()}`
      
      const createGroupResponse = await fetch('https://connect.mailerlite.com/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: tempGroupName })
      })

      if (!createGroupResponse.ok) {
        const errorText = await createGroupResponse.text()
        console.error(`❌ Error creando grupo temporal:`, errorText)
        return {
          success: false,
          error: 'Error creando grupo temporal para prueba',
          email: emailData.to
        }
      }

      const groupData = await createGroupResponse.json()
      tempGroupId = groupData.data?.id || groupData.id
      // Temporarily set the group ID environment variable
      process.env.MAILERLITE_GROUP_ID = tempGroupId
      console.log(`✅ Grupo temporal creado: ${tempGroupId}`)
    }

    // Use sendBulkEmails which already works correctly
    const results = await sendBulkEmails([emailData])
    
    // Restore original group ID
    if (useTemporaryGroup && originalGroupId !== undefined) {
      process.env.MAILERLITE_GROUP_ID = originalGroupId
    } else if (useTemporaryGroup) {
      delete process.env.MAILERLITE_GROUP_ID
    }

    const result = results[0] || {
      success: false,
      error: 'Error enviando email',
      email: emailData.to
    }

    // Clean up temporary group after a delay if it was created
    if (tempGroupId && result.success) {
      setTimeout(async () => {
        try {
          await fetch(`https://connect.mailerlite.com/api/groups/${tempGroupId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Accept': 'application/json'
            }
          })
          console.log(`🧹 Grupo temporal eliminado: ${tempGroupId}`)
        } catch (error) {
          console.warn(`⚠️ No se pudo eliminar grupo temporal:`, error)
        }
      }, 10000) // Wait 10 seconds before cleanup
    }

    return result

  } catch (error: any) {
    console.error(`❌ Error MailerLite para ${emailData.to}:`, error.message)
    
    // Clean up temp group if it was created
    if (tempGroupId) {
      try {
        await fetch(`https://connect.mailerlite.com/api/groups/${tempGroupId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json'
          }
        })
      } catch {}
    }
    
    return {
      success: false,
      error: error.message || 'Error desconocido',
      email: emailData.to
    }
  }
}

/**
 * Send bulk emails using MailerLite Campaigns API
 * 
 * This is the recommended approach for MailerLite as it's designed for marketing campaigns.
 * We'll create a campaign and send it to all subscribers.
 */
export const sendBulkEmails = async (emails: EmailData[]): Promise<MailerLiteResponse[]> => {
  const apiKey = process.env.MAILERLITE_API_KEY
  const fromEmail = process.env.MAILERLITE_FROM_EMAIL
  const fromName = process.env.MAILERLITE_FROM_NAME || 'Markets & Finance'
  const groupId = process.env.MAILERLITE_GROUP_ID

  if (!apiKey) {
    console.error('❌ MAILERLITE_API_KEY no está configurada')
    return emails.map(email => ({
      success: false,
      error: 'MailerLite API key no configurada',
      email: email.to
    }))
  }

  if (!fromEmail) {
    console.error('❌ MAILERLITE_FROM_EMAIL no está configurada')
    return emails.map(email => ({
      success: false,
      error: 'MailerLite from email no configurada',
      email: email.to
    }))
  }

  if (!emails || emails.length === 0) {
    return []
  }

  // Use the first email's subject and content (assuming all are the same for a newsletter)
  const firstEmail = emails[0]
  
  console.log(`📧 Preparando envío masivo de newsletter a ${emails.length} suscriptores`)
  console.log(`📧 Asunto: ${firstEmail.subject}`)

  try {
    // Step 1: Ensure all subscribers exist in MailerLite
    console.log(`📧 Añadiendo ${emails.length} suscriptores a MailerLite...`)
    const subscriberPromises = emails.map(email => 
      ensureSubscriber(email.to, apiKey, groupId)
    )
    const subscriberResults = await Promise.allSettled(subscriberPromises)
    
    const failedSubscribers = subscriberResults.filter(r => r.status === 'rejected').length
    if (failedSubscribers > 0) {
      console.warn(`⚠️ ${failedSubscribers} suscriptores no pudieron ser añadidos a MailerLite`)
    }

    // Step 2: Create a campaign in MailerLite
    // MailerLite uses campaigns for sending emails to groups
    const campaignUrl = 'https://connect.mailerlite.com/api/campaigns'
    
    const campaignPayload: any = {
      type: 'regular',
      name: firstEmail.subject, // MailerLite requires a name field
      subject: firstEmail.subject,
      from: {
        email: fromEmail,
        name: fromName
      },
      content: {
        html: firstEmail.html,
        plain: firstEmail.text || firstEmail.html.replace(/<[^>]*>/g, '')
      },
      settings: {
        track_opens: true,
        track_clicks: true
      }
    }

    // MailerLite: when using groups, don't include emails field
    // When not using groups, emails field is required but has complex structure
    // For now, we require a group ID to be configured
    if (!groupId) {
      console.error('❌ MAILERLITE_GROUP_ID no está configurado')
      return emails.map(email => ({
        success: false,
        error: 'MailerLite group ID requerido para enviar campañas',
        email: email.to
      }))
    }
    
    campaignPayload.groups = [groupId]

    console.log(`📧 Creando campaña en MailerLite...`)
    const campaignResponse = await fetch(campaignUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(campaignPayload)
    })

    if (!campaignResponse.ok) {
      const errorText = await campaignResponse.text()
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || `HTTP ${campaignResponse.status}` }
      }

      console.error(`❌ Error creando campaña en MailerLite:`, errorData)
      console.error(`📋 Respuesta completa:`, errorText)
      
      // Return failed results for all emails
      return emails.map(email => ({
        success: false,
        error: errorData.message || errorData.error?.message || `HTTP ${campaignResponse.status}`,
        email: email.to
      }))
    }

    const campaignResult = await campaignResponse.json()
    const campaignId = campaignResult.data?.id || campaignResult.id

    if (!campaignId) {
      console.error(`❌ No se obtuvo ID de campaña de MailerLite`)
      console.error(`📋 Respuesta completa:`, JSON.stringify(campaignResult, null, 2))
      return emails.map(email => ({
        success: false,
        error: 'No se pudo crear la campaña - ID no encontrado',
        email: email.to
      }))
    }

    console.log(`✅ Campaña creada en MailerLite con ID: ${campaignId}`)

    // Step 3: Send the campaign
    // MailerLite campaigns can be sent immediately or scheduled
    const sendUrl = `https://connect.mailerlite.com/api/campaigns/${campaignId}/actions/send`
    
    const sendPayload: any = {
      type: 'regular'
    }

    // If we have a group ID, send to that group
    // Otherwise, send to all subscribers (which is what we want for newsletters)
    if (groupId) {
      sendPayload.groups = [groupId]
    }

    console.log(`📧 Enviando campaña a suscriptores...`)
    const sendResponse = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify(sendPayload)
    })

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text()
      let errorData: any = {}
      
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText || `HTTP ${sendResponse.status}` }
      }

      console.error(`❌ Error enviando campaña en MailerLite:`, errorData)
      console.error(`📋 Respuesta completa:`, errorText)
      
      return emails.map(email => ({
        success: false,
        error: errorData.message || errorData.error?.message || `HTTP ${sendResponse.status}`,
        email: email.to
      }))
    }

    const sendResult = await sendResponse.json().catch(() => ({}))
    console.log(`✅ Campaña enviada exitosamente`)
    console.log(`📋 Resultado:`, JSON.stringify(sendResult, null, 2))
    
    // All emails are considered sent successfully when the campaign is sent
    // MailerLite handles delivery to all subscribers in the group or all active subscribers
    return emails.map(email => ({
      success: true,
      messageId: `ml_campaign_${campaignId}`,
      email: email.to
    }))

  } catch (error: any) {
    console.error(`❌ Error en envío masivo MailerLite:`, error.message)
    console.error(`📋 Stack trace:`, error.stack)
    return emails.map(email => ({
      success: false,
      error: error.message || 'Error desconocido',
      email: email.to
    }))
  }
}
