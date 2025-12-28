# 🔧 Configuración de MailerLite - Variables de Entorno

## ⚠️ IMPORTANTE: Seguridad

**NUNCA** subas tu API Key a Git o repositorios públicos. Las variables de entorno deben estar solo en:
- Archivo `.env.local` (local, en `.gitignore`)
- Variables de entorno de Vercel (producción)

## 📝 Variables a Configurar

Copia estas variables a tu archivo `.env.local` (o configúralas en Vercel):

```env
# MailerLite Configuration
MAILERLITE_API_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI0IiwianRpIjoiZTYxYjljODI4YThlNDkwOTMzMWQzNWY2NmNiNjFhZGRmYzA5M2JmZjM5NGU2OWU1ZTM4ZjA1MDVjNTY1YjFjODRkZmRlZmJiMTQ2OThmMjgiLCJpYXQiOjE3NjY5NDkxMjAuNzg4MjIxLCJuYmYiOjE3NjY5NDkxMjAuNzg4MjIzLCJleHAiOjQ5MjI2MjI3MjAuNzg0MjYxLCJzdWIiOiIyMDIyNzMyIiwic2NvcGVzIjpbXX0.Gcr5N-hrmPHiQR90qLFcAT9xdmWR-AFHT32I4lwQqDkfb4q3m_bbC56zOqnQtd0pyB28lrfpaO95feFKyPFp-UsFreL4Q01m26hdB9Tnvx1Bg1WWzWYZMhRt5X2TJ3-Ppi_i-Z38fflLvwq5YrGh12fYBWPS6WBjBVHDFcsoFKpwgE01cMriEoLLDO6zYXN55ODH4tnRRr2ey-3jGk0D6Jq-tTzNc9b4UinCiBQ-F-BT0Wlh8R2Bqn0sRYyYzxa-wsCzm_9tE6E0bNWbfQocmCo0Y_XKq5SB0M4yOxOJ9nEQOTeNgdbFNj9QIzbwqV7dmdHWu6PWpRJp37snI9Oh6spbeYoqNm81wkFm4bo1z6k2VHasnAvUwE1rxjt-PAWIeYFdTVKUYwnE5mg6NFFXli40R9m8ptlVUfa5KRZF75N4DnBaJg3tAok6mLxczk6IIS9UWP73fV26ojYQCY8UY6qx5dKlGsq05N3f5T6dfcaTCY2Vx98hKJW9hc5Tk05DAE4AdWOYLPphH4WAwK88z2WObXckIYwRCYX2ikKSTzwFYoEi_SjCVLXz_TLpk-vglR6PcoMnBvi8Tkd6JEq_7DsmqQL9w1XpqL-esSXu_QgilqOIDy8oM7idYiInyY6EguZZeIqM6rWd_j3oUBzW72_1fhzvLIcGt5zaixxyrPI
MAILERLITE_FROM_EMAIL=noreply@marketsfinancenewsletter.com
MAILERLITE_FROM_NAME=Markets & Finance
# Opcional: Si tienes un grupo específico en MailerLite
# MAILERLITE_GROUP_ID=tu_group_id
```

## 🚀 Pasos para Configurar

### 1. Configurar Variables Locales (.env.local)

1. Crea o edita el archivo `.env.local` en la raíz del proyecto
2. Añade las variables de MailerLite mostradas arriba
3. Asegúrate de que `.env.local` esté en `.gitignore` (debería estarlo por defecto)

### 2. Configurar Variables en Vercel (Producción)

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Añade cada variable:
   - `MAILERLITE_API_KEY` = (tu API key)
   - `MAILERLITE_FROM_EMAIL` = `noreply@marketsfinancenewsletter.com`
   - `MAILERLITE_FROM_NAME` = `Markets & Finance`
4. Guarda y redeploya si es necesario

### 3. Verificar Configuración

Después de configurar las variables:

```bash
# Reinicia el servidor de desarrollo
pnpm dev
```

Verifica en los logs que no aparezcan errores sobre variables faltantes.

## ✅ Verificación

Una vez configuradas las variables, deberías poder:

1. ✅ Enviar newsletters desde el panel de administración
2. ✅ Ver logs de MailerLite sin errores de autenticación
3. ✅ Recibir emails correctamente

## 🔒 Seguridad Adicional

Considera:

1. **Rotar la API Key** periódicamente desde el panel de MailerLite
2. **Restringir por IP** si es posible (configuración avanzada en MailerLite)
3. **Usar variables de entorno** en lugar de hardcodear valores
4. **No compartir** tu API Key públicamente

---

**Nota:** Este archivo puede ser eliminado después de configurar las variables, ya que contiene información sensible.

