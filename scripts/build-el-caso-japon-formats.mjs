import fs from 'node:fs'
import path from 'node:path'
import { JSDOM } from 'jsdom'

const projectRoot = process.cwd()
const sourcePath = path.join(projectRoot, 'content/articles/el-caso-japon.txt')
const outputDir = path.join(projectRoot, 'publishing/el-caso-japon')
const source = fs.readFileSync(sourcePath, 'utf8').replace(/\r/g, '').trim()
const lines = source.split('\n')
const title = lines.shift()

const headings = new Set([
  'Introducción:',
  'Los hechos más recientes',
  'Cómo Japón llegó hasta aquí',
  'El yen como moneda de financiación: el carry trade',
  'El régimen empieza a cambiar: inflación y normalización del BoJ',
  'Takaichi: la dama de hierro japonesa',
  'El problema cruza el Pacífico',
])

const pullQuotes = new Set([
  'Pocos países permiten estudiar esas relaciones con tanta claridad como Japón.',
  'Hasta aquí, nada novedoso. Lo verdaderamente excepcional ocurriría a posteriori.',
  'El resultado: el yen pasó a convertirse en una de las principales monedas de financiación a nivel internacional.',
  'Este mecanismo recibe el nombre de carry trade.',
  'Aquí aparece una de las grandes tensiones del caso Japón.',
  'Y en medio de esa tensión se encuentra el yen.',
  'Quizá la cuestión no fuese únicamente sostener el yen.',
  'En otras palabras: el yen estaba cayendo en Tokio, pero una parte importante del riesgo podía terminar materializándose en Washington.',
])

const sections = []
for (const line of lines) {
  if (headings.has(line)) {
    sections.push({ heading: line, paragraphs: [] })
  } else {
    sections.at(-1)?.paragraphs.push(line)
  }
}

const escapeHtml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')

const absoluteBase = 'https://markets-finance-newsletter.vercel.app/images/articles/el-caso-japon'
const localBase = '../../public/images/articles/el-caso-japon'

const emailParagraph = (paragraph) => {
  if (pullQuotes.has(paragraph)) {
    return `<tr><td data-article-line style="padding:22px 0 28px 24px;border-left:3px solid #b9252d;font-family:Georgia,'Times New Roman',serif;font-size:25px;line-height:1.35;color:#17191e;">${escapeHtml(paragraph)}</td></tr>`
  }
  return `<tr><td data-article-line style="padding:0 0 19px;font-family:Georgia,'Times New Roman',serif;font-size:17px;line-height:1.72;color:#2b2d31;">${escapeHtml(paragraph)}</td></tr>`
}

const emailSections = sections.map((section, sectionIndex) => {
  const body = section.paragraphs.map((paragraph, paragraphIndex) => {
    const paragraphHtml = emailParagraph(paragraph)
    if (sectionIndex === 0 && paragraphIndex === 1) {
      return `${paragraphHtml}<tr><td style="padding:22px 0 40px;"><img src="${absoluteBase}/nixon-speech.jpg" width="620" alt="Richard Nixon durante el discurso televisado del 15 de agosto de 1971" style="display:block;width:100%;max-width:620px;height:auto;border:0;border-radius:14px;"><div style="padding:9px 12px 0;font-family:Arial,sans-serif;font-size:11px;line-height:1.45;color:#77736d;text-align:center;">Richard Nixon durante el discurso televisado del 15 de agosto de 1971. Fuente: Richard Nixon Presidential Library.</div></td></tr>`
    }
    if (section.heading === 'El yen como moneda de financiación: el carry trade' && paragraphIndex === section.paragraphs.length - 1) {
      return `${paragraphHtml}<tr><td style="padding:22px 0 40px;"><img src="${absoluteBase}/bank-of-japan.jpg" width="620" alt="Sede central del Banco de Japón en Tokio" style="display:block;width:100%;max-width:620px;height:auto;border:0;border-radius:14px;"><div style="padding:9px 12px 0;font-family:Arial,sans-serif;font-size:11px;line-height:1.45;color:#77736d;text-align:center;">Sede central del Banco de Japón en Tokio. Fotografía: Fg2, dominio público.</div></td></tr>`
    }
    return paragraphHtml
  }).join('\n')

  return `
    <tr><td style="padding:${sectionIndex === 0 ? '42px' : '58px'} 0 12px;border-top:${sectionIndex === 0 ? '0' : '1px solid #ddd8d0'};font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#b9252d;">${String(sectionIndex + 1).padStart(2, '0')}</td></tr>
    <tr><td data-article-line style="padding:0 0 30px;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.12;color:#17191e;">${escapeHtml(section.heading)}</td></tr>
    ${body}`
}).join('\n')

const emailHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <title>${escapeHtml(title)}</title>
  <!--[if mso]><style>table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background:#ece9e3;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(sections[0].paragraphs[0])}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background:#ece9e3;">
    <tr><td align="center" style="padding:24px 10px;">
      <table role="presentation" width="680" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:680px;background:#f7f5f1;">
        <tr>
          <td style="padding:22px 30px;background:#111319;color:#fff;font-family:Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:.2px;">M&amp;F&nbsp;&nbsp; Markets &amp; Finance</td>
        </tr>
        <tr>
          <td><img src="${absoluteBase}/linkedin-cover.jpg" width="680" alt="Sanae Takaichi pronunciando un discurso en la Casa Blanca" style="display:block;width:100%;max-width:680px;height:auto;border:0;"></td>
        </tr>
        <tr>
          <td style="padding:44px 30px 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;color:#b9252d;text-transform:uppercase;">Artículo · 21 de agosto de 2026</td>
        </tr>
        <tr>
          <td data-article-line style="padding:0 30px 42px;font-family:Georgia,'Times New Roman',serif;font-size:52px;line-height:.98;letter-spacing:-2px;color:#17191e;">${escapeHtml(title)}</td>
        </tr>
        <tr>
          <td style="padding:0 30px 56px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
${emailSections}
            </table>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:38px 30px;background:#111319;">
            <a href="{{web_url}}" style="display:inline-block;padding:13px 24px;border:1px solid #fff;border-radius:999px;color:#fff;font-family:Arial,sans-serif;font-size:13px;font-weight:700;text-decoration:none;">Leer en la web</a>
            <div style="padding-top:24px;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:#aeb1b8;">Markets &amp; Finance Newsletter<br><a href="{{unsubscribe_url}}" style="color:#d5d6da;text-decoration:underline;">Darse de baja</a></div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

const linkedinSections = sections.map((section, sectionIndex) => {
  const paragraphs = section.paragraphs.map((paragraph, paragraphIndex) => {
    const tag = pullQuotes.has(paragraph) ? 'blockquote' : 'p'
    let output = `<${tag} data-article-line>${escapeHtml(paragraph)}</${tag}>`
    if (sectionIndex === 0 && paragraphIndex === 1) {
      output += `<img src="${localBase}/nixon-speech.jpg" alt="Richard Nixon durante el discurso televisado del 15 de agosto de 1971">`
    }
    if (section.heading === 'El yen como moneda de financiación: el carry trade' && paragraphIndex === section.paragraphs.length - 1) {
      output += `<img src="${localBase}/bank-of-japan.jpg" alt="Sede central del Banco de Japón en Tokio">`
    }
    return output
  }).join('\n')
  return `<h2 data-article-line>${escapeHtml(section.heading)}</h2>\n${paragraphs}`
}).join('\n')

const linkedinHtml = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>LinkedIn · ${escapeHtml(title)}</title>
  <style>
    *{box-sizing:border-box}body{margin:0;background:#eef0f2;color:#1b1f23;font-family:Arial,sans-serif}.shell{max-width:930px;margin:48px auto;background:#fff;box-shadow:0 12px 50px rgba(0,0,0,.08)}.cover{display:block;width:100%;aspect-ratio:16/9;object-fit:cover}.article{max-width:760px;margin:auto;padding:56px 48px 80px}.label{margin:0 0 12px;color:#666;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}h1{margin:0 0 52px;font-family:Georgia,serif;font-size:58px;line-height:1;letter-spacing:-.045em}h2{margin:72px 0 28px;font-size:30px;line-height:1.15}p{margin:0 0 22px;font-family:Georgia,serif;font-size:19px;line-height:1.72}blockquote{margin:42px 0;padding:8px 0 8px 24px;border-left:4px solid #b9252d;font-family:Georgia,serif;font-size:27px;line-height:1.38;color:#20242a}img{display:block;width:calc(100% + 64px);height:auto;margin:44px -32px;border-radius:4px}@media(max-width:700px){.shell{margin:0}.article{padding:36px 24px 60px}h1{font-size:43px}h2{font-size:27px}p{font-size:18px}blockquote{font-size:23px}img{width:100%;margin:32px 0}}
  </style>
</head>
<body>
  <main class="shell">
    <img class="cover" src="${localBase}/linkedin-cover.jpg" alt="Sanae Takaichi pronunciando un discurso en la Casa Blanca">
    <article class="article">
      <p class="label">Markets &amp; Finance Newsletter</p>
      <h1 data-article-line>${escapeHtml(title)}</h1>
      ${linkedinSections}
    </article>
  </main>
</body>
</html>`

const guide = `# LinkedIn — ${title}

Archivos preparados:

- Portada: \`public/images/articles/el-caso-japon/linkedin-cover.jpg\` (1920 × 1080).
- Imagen interior 1: \`public/images/articles/el-caso-japon/nixon-speech.jpg\`.
- Imagen interior 2: \`public/images/articles/el-caso-japon/bank-of-japan.jpg\`.
- Texto limpio para pegar: \`publishing/el-caso-japon/linkedin-copy.txt\`.
- Vista de maquetación y fuente para copiar: \`publishing/el-caso-japon/linkedin-article.html\`.

## Cómo publicarlo como edición de Markets & Finance Newsletter

1. En LinkedIn desde un ordenador, pulsa **Escribir artículo**.
2. Abre el desplegable situado junto a tu nombre, arriba a la izquierda.
3. Selecciona la identidad desde la que publicas y, dentro del mismo desplegable, **Markets & Finance Newsletter**. Es importante no dejar seleccionada la opción **Artículo individual**.
4. Pulsa **Cargar desde el ordenador** y sube \`linkedin-cover.jpg\`.
5. En **Título**, pega exactamente: **${title}**
6. Abre \`linkedin-copy.txt\`, copia todo y pégalo en **Escribe aquí**. LinkedIn no permite importar el archivo HTML; el HTML adjunto es solo una referencia visual.
7. Selecciona cada uno de los siete encabezados y, en **Estilo**, aplica el formato de encabezado. Mantén «Introducción:» como el primero.
8. Sitúa el cursor después del segundo párrafo de «Introducción:», pulsa el icono de imagen y sube \`nixon-speech.jpg\`.
9. Sitúa el cursor al final de «El yen como moneda de financiación: el carry trade», pulsa el icono de imagen y sube \`bank-of-japan.jpg\`.
10. Usa **Gestionar → Vista previa** para revisar el resultado. Cuando esté correcto, pulsa **Siguiente**, añade el texto breve de presentación de la publicación y finalmente **Publicar**.

LinkedIn aplicará su propia tipografía y espaciado. El editor de artículos solo está disponible en escritorio o navegador de tableta, no en la aplicación móvil.

Ayuda oficial de LinkedIn:

- https://www.linkedin.com/help/linkedin/answer/a522427/
- https://www.linkedin.com/help/linkedin/answer/a516987
`

const readme = `# Entregables — El caso Japón.

- \`email.html\`: HTML de email responsive y compatible con Outlook/Gmail/Apple Mail.
- \`linkedin-article.html\`: versión visual para preparar el artículo en el editor de LinkedIn.
- \`linkedin-copy.txt\`: texto limpio y exacto para pegar en LinkedIn.
- \`linkedin-publishing-guide.md\`: orden exacto de carga y colocación de imágenes.
- Web pública: \`/articulos/el-caso-japon\`.

Antes de enviar el email, sustituir \`{{web_url}}\` y \`{{unsubscribe_url}}\` por los campos correspondientes de la plataforma de envío. Las imágenes ya apuntan a sus futuras rutas públicas en Vercel.

Los tres formatos se generan desde \`content/articles/el-caso-japon.txt\`. No se modifica ni resume el contenido.
`

fs.mkdirSync(outputDir, { recursive: true })
fs.writeFileSync(path.join(outputDir, 'email.html'), emailHtml)
fs.writeFileSync(path.join(outputDir, 'linkedin-article.html'), linkedinHtml)
fs.writeFileSync(path.join(outputDir, 'linkedin-copy.txt'), source)
fs.writeFileSync(path.join(outputDir, 'linkedin-publishing-guide.md'), guide)
fs.writeFileSync(path.join(outputDir, 'README.md'), readme)

for (const [name, html] of [['email.html', emailHtml], ['linkedin-article.html', linkedinHtml]]) {
  const document = new JSDOM(html).window.document
  const renderedLines = [...document.querySelectorAll('[data-article-line]')].map((node) => node.textContent)
  if (renderedLines.join('\n') !== source) {
    throw new Error(`${name} does not preserve the source article verbatim`)
  }
}

console.log('Built and verified email.html, linkedin-article.html, linkedin-copy.txt, linkedin-publishing-guide.md, and README.md')
