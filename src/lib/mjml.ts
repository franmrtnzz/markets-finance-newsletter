import mjml2html from 'mjml'
import { JSDOM } from 'jsdom'
import createDOMPurify from 'dompurify'

// Create DOMPurify instance for server-side sanitization
const window = new JSDOM('').window
const DOMPurify = createDOMPurify(window as any)

export interface NewsletterData {
  title: string
  preheader: string
  content: string
  issueUrl: string
  unsubscribeUrl: string
}

export const compileNewsletterTemplate = (data: NewsletterData): string => {
  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>${data.title}</mj-title>
        <mj-preview>${data.preheader}</mj-preview>
        <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <mj-attributes>
          <mj-all font-family="Inter, Arial, sans-serif" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#f8fafc">
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text font-size="24px" font-weight="700" color="#1e293b" align="center" padding-bottom="20px">
              Markets & Finance
            </mj-text>
            <mj-divider border-color="#e2e8f0" border-width="1px" />
          </mj-column>
        </mj-section>
        
        <mj-section background-color="#ffffff" padding="20px">
          <mj-column>
            <mj-text font-size="18px" font-weight="600" color="#1e293b" padding-bottom="16px">
              ${data.title}
            </mj-text>
            <mj-text font-size="16px" color="#475569" line-height="1.6">
              ${data.content}
            </mj-text>
          </mj-column>
        </mj-section>
        
        <mj-section background-color="#f1f5f9" padding="20px">
          <mj-column>
            <mj-button href="${data.issueUrl}" background-color="#3b82f6" color="white" font-weight="600" padding="12px 24px" border-radius="8px">
              Ver en web
            </mj-button>
            <mj-text font-size="14px" color="#64748b" align="center" padding-top="16px">
              <a href="${data.unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Darse de baja</a>
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `

  const { html, errors } = mjml2html(mjmlTemplate)
  
  if (errors && errors.length > 0) {
    console.error('MJML compilation errors:', errors)
  }

  // Sanitize the HTML for security
  return DOMPurify.sanitize(html)
} 