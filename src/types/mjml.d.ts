declare module 'mjml' {
  interface MJMLResult {
    html: string
    errors: string[]
  }
  
  function mjml2html(mjml: string): MJMLResult
  
  export = mjml2html
} 