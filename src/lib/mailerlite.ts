// MailerLite API integration for sending emails
// Documentation: https://developers.mailerlite.com/

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

interface MailerLiteResponse {
  success: boolean
  error?: string
  messageId?: string
  email: string
}

/**
 * Ensure a subscriber exists in MailerLite and add them to a group if provided
 */
async function ensureSubscriber(email: string, apiKey: string, groupId: string | null | undefined): Promise<boolean> {
  try {
    const url = 'https://connect.mailerlite.com/api/subscribers'
    const payload: any = {
      email: email,
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

    if (!response.ok) {
      const text = await response.text()
      try {
        const json = JSON.parse(text)
        // If subscriber exists, it might return 200 or 201, but sometimes 422 if invalid.
        // We log warnings but don't fail drastically unless it's critical.
        if (response.status !== 200 && response.status !== 201) {
             console.warn(`⚠️ Warning ensuring subscriber ${email}: ${json.message || text}`)
        }
      } catch (e) {
        console.warn(`⚠️ Error ensuring subscriber ${email}: ${text}`)
      }
    }
    return true
  } catch (error) {
    console.error(`❌ Exception ensuring subscriber ${email}:`, error)
    return false
  }
}

async function cleanupGroup(groupId: string, apiKey: string) {
    try {
        await fetch(`https://connect.mailerlite.com/api/groups/${groupId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${apiKey}` }
        })
        console.log(`🧹 Grupo temporal ${groupId} eliminado.`)
    } catch (e) {
        console.warn(`⚠️ Error eliminando grupo temporal ${groupId}:`, e)
    }
}

/**
 * Send a single transactional email using MailerLite
 * (Wraps bulk logic for consistency)
 */
export const sendEmail = async (emailData: EmailData, useTemporaryGroup: boolean = false): Promise<MailerLiteResponse> => {
  const results = await sendBulkEmails([emailData])
  return results[0] || { success: false, error: 'No response', email: emailData.to }
}

/**
 * Send bulk emails using MailerLite Campaigns API
 */
export const sendBulkEmails = async (emails: EmailData[]): Promise<MailerLiteResponse[]> => {
  const apiKey = process.env.MAILERLITE_API_KEY
  const fromEmail = process.env.MAILERLITE_FROM_EMAIL
  const fromName = process.env.MAILERLITE_FROM_NAME || 'Markets & Finance'
  
  // Use configured group, or null to trigger temp group creation if needed
  let groupId = process.env.MAILERLITE_GROUP_ID
  let tempGroupId: string | null = null

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

  const firstEmail = emails[0]
  console.log(`📧 Preparando envío masivo de newsletter a ${emails.length} suscriptores`)

  try {
    // If no configured groupId, create a temporary group
    if (!groupId) {
      console.log('ℹ️ MAILERLITE_GROUP_ID no configurado. Creando grupo temporal...')
      const createGroupResp = await fetch('https://connect.mailerlite.com/api/groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({ name: `Temp-News-${Date.now()}-${Math.floor(Math.random() * 1000)}` })
      })

      if (!createGroupResp.ok) {
        const errText = await createGroupResp.text()
        console.error('❌ Error creando grupo temporal en MailerLite:', errText)
        return emails.map(email => ({ success: false, error: 'No se pudo crear grupo temporal en MailerLite', email: email.to }))
      }

      const groupData = await createGroupResp.json()
      groupId = groupData.data?.id || groupData.id
      
      if (!groupId) {
        console.error('❌ No se obtuvo ID del grupo temporal en MailerLite')
        return emails.map(email => ({ success: false, error: 'No se obtuvo ID del grupo temporal', email: email.to }))
      }

      tempGroupId = groupId
      console.log(`✅ Grupo temporal creado: ${groupId}`)
    }

    // Step 1: Ensure all subscribers exist in MailerLite and are in the group
    console.log(`📧 Añadiendo ${emails.length} suscriptores a MailerLite (grupo ${groupId})...`)
    const subscriberPromises = emails.map(email => ensureSubscriber(email.to, apiKey!, groupId))
    await Promise.allSettled(subscriberPromises)

    // Step 2: Create a campaign
    const campaignUrl = 'https://connect.mailerlite.com/api/campaigns'
    const campaignPayload: any = {
      type: 'regular',
      name: firstEmail.subject || `Newsletter ${Date.now()}`,
      subject: firstEmail.subject,
      from: {
        email: fromEmail,
        name: fromName
      },
      content: {
        html: firstEmail.html,
        plain: firstEmail.text || firstEmail.html.replace(/<[^>]*>/g, '') 
      },
      groups: [groupId]
    }

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
      try { errorData = JSON.parse(errorText) } catch { errorData = { message: errorText } }
      
      console.error(`❌ Error creando campaña en MailerLite:`, errorData)
      
      if (tempGroupId) await cleanupGroup(tempGroupId, apiKey)
      
      return emails.map(email => ({ success: false, error: errorData.message || `HTTP ${campaignResponse.status}`, email: email.to }))
    }

    const campaignResult = await campaignResponse.json()
    const campaignId = campaignResult.data?.id || campaignResult.id

    if (!campaignId) {
        console.error(`❌ No se obtuvo ID de campaña de MailerLite`)
        if (tempGroupId) await cleanupGroup(tempGroupId, apiKey)
        return emails.map(email => ({ success: false, error: 'No se pudo crear la campaña', email: email.to }))
    }

    console.log(`✅ Campaña creada: ${campaignId}`)

    // Step 3: Send the campaign
    const sendUrl = `https://connect.mailerlite.com/api/campaigns/${campaignId}/actions/send`
    const sendPayload = { type: 'regular' } 

    console.log(`📧 Disparando envío de campaña...`)
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
      console.error(`❌ Error enviando campaña:`, errorText)
      if (tempGroupId) await cleanupGroup(tempGroupId, apiKey)
      return emails.map(email => ({ success: false, error: `Error enviando campaña: ${errorText}`, email: email.to }))
    }

    console.log(`✅ Campaña enviada exitosamente`)

    // Cleanup temp group if used
    if (tempGroupId) {
       await cleanupGroup(tempGroupId, apiKey)
    }

    return emails.map(email => ({ success: true, messageId: `ml_campaign_${campaignId}`, email: email.to }))

  } catch (error: any) {
    console.error(`❌ Error crítico en MailerLite:`, error)
    if (tempGroupId) cleanupGroup(tempGroupId, apiKey).catch(console.error)
    return emails.map(email => ({
      success: false,
      error: error.message || 'Error desconocido',
      email: email.to
    }))
  }
}
