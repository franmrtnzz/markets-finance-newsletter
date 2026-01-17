// Compatibility stub for legacy SendGrid imports.
// If MailerLite is configured, delegate to MailerLite functions.
// This file exists to avoid build failures when older commits
// or code paths still import from `src/lib/sendgrid.ts`.

import { sendEmail as mlSendEmail, sendBulkEmails as mlSendBulkEmails } from './mailerlite'

export interface EmailData {
  to: string
  subject: string
  html: string
  text?: string
}

export const sendEmail = async (emailData: EmailData, useTemporaryGroup: boolean = false) => {
  if (process.env.MAILERLITE_API_KEY) {
    return mlSendEmail(emailData, useTemporaryGroup)
  }

  console.warn('sendgrid stub: MAILERLITE_API_KEY not configured; SendGrid removed')
  return { success: false, error: 'SendGrid not configured', email: emailData.to }
}

export const sendBulkEmails = async (emails: EmailData[]) => {
  if (process.env.MAILERLITE_API_KEY) {
    return mlSendBulkEmails(emails)
  }

  console.warn('sendgrid stub: MAILERLITE_API_KEY not configured; SendGrid removed')
  return emails.map(e => ({ success: false, error: 'SendGrid not configured', email: e.to }))
}

export default { sendEmail, sendBulkEmails }
