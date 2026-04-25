# Markets & Finance

Web personal para una newsletter informal sobre mercados, finanzas y economía. Incluye:

- 📬 **Captación de suscriptores** (con doble opt-in básico)
- 🗂️ **Archivo público** de newsletters, artículos (PDF) y notas cortas
- ❤️ **Likes anónimos** y 💬 **comentarios con login Google** en los contenidos
- 🔒 **Panel admin privado** para gestionar suscriptores y publicar contenido
- 📋 **Envío manual**: el panel te permite copiar todos los emails activos al portapapeles para enviar la newsletter desde tu cliente de correo (sin proveedor externo, sin coste).

## Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS**
- **Supabase** (Postgres + Auth + Storage + RLS)
- **Vercel** (hosting)

Coste objetivo: **0 €/mes**.

## Estado

🚧 En reconstrucción. Ver el roadmap por fases más abajo.

### Fase 1 — Limpieza y rediseño visual ✅ en curso
- [x] Borrado de docs e infraestructura obsoleta (SendGrid, MailerLite, crons fantasma…)
- [x] Sistema de diseño Apple-style (tipografía, paleta, componentes base)
- [x] Home pública nueva
- [x] Navegación + footer compartidos
- [x] Páginas stub: `/newsletters`, `/articulos`, `/notas`

### Fase 2 — Modelo de datos y publicaciones
- [ ] Tablas `newsletters`, `articles`, `notes`, `likes`, `comments`
- [ ] Storage de Supabase para PDFs e imágenes
- [ ] Páginas individuales: `/newsletters/[slug]`, `/articulos/[slug]`, `/notas/[slug]`

### Fase 3 — Panel admin
- [ ] Rediseño del panel
- [ ] Botón "Copiar emails activos al portapapeles" + exportar CSV
- [ ] Editor de newsletters (pegar HTML + preview en iframe)
- [ ] Editor de artículos (subir PDF + descripción)
- [ ] Editor de notas (texto corto)
- [ ] Moderación de comentarios

### Fase 4 — Interacción pública
- [ ] Likes anónimos (cookie/fingerprint, sin login)
- [ ] Comentarios con Google OAuth (Supabase Auth)

## Variables de entorno

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Admin
ADMIN_PASSWORD=

# App
BASE_URL=https://marketsfinancenewsletter.com
```

## Desarrollo local

```bash
pnpm install
cp env.example .env.local   # rellenar con tus claves
pnpm dev
```

## Estructura

```
src/
  app/
    page.tsx                 Home (suscripción + destacados)
    newsletters/             Archivo público de newsletters
    articulos/               Archivo público de artículos
    notas/                   Notas cortas
    admin/                   Panel privado (login + gestión)
    api/
      subscribe/             Alta
      confirm/               Confirmación doble opt-in
      unsubscribe/           Baja
      admin/                 Endpoints protegidos del panel
  components/
    SiteNav.tsx              Nav pública
    SiteFooter.tsx           Footer público
  lib/
    supabase.ts              Clientes de Supabase
    mjml.ts                  Render MJML (legacy, en revisión)
```
