# Markets & Finance Newsletter

Plataforma sencilla y gratuita para gestionar suscriptores y enviar newsletters semanales.

## 🚀 Características

- **Suscripción con doble opt-in** (RGPD compliant)
- **Panel admin** para gestionar suscriptores y newsletters
- **Envío automático** programado para domingos a las 09:00 (Madrid)
- **Plantillas MJML** para emails responsivos
- **Gestión de rebotes y bajas** automática
- **Archivo público** para ver newsletters en web
- **Coste 0€** - solo planes gratuitos

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Email**: SendGrid (100 emails/día gratis)
- **Hosting**: Vercel + Vercel Cron
- **Node.js**: v22 LTS (ARM64 compatible)

## 📋 Requisitos Previos

- Node.js 22+ (ARM64 compatible)
- Cuenta en [Supabase](https://supabase.com) (gratis)
- Cuenta en [SendGrid](https://sendgrid.com) (gratis)
- Cuenta en [Vercel](https://vercel.com) (gratis)

## ⚙️ Instalación

### 1. Clonar y instalar dependencias

```bash
# Usar pnpm (recomendado)
pnpm install

# O npm
npm install
```

### 2. Configurar variables de entorno

Copia `env.example` a `.env.local` y rellena:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[TU_PROYECTO].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[CLAVE_ANONIMA_PUBLICA]
SUPABASE_SERVICE_ROLE_KEY=[CLAVE_SERVICIO_PRIVADA]

# SendGrid
SENDGRID_API_KEY=[TU_API_KEY]
SENDGRID_FROM_EMAIL=noreply@[tuapp].vercel.app
SENDGRID_FROM_NAME="Markets & Finance"

# Admin
ADMIN_PASSWORD=[TU_CONTRASEÑA_ADMIN]

# App
BASE_URL=https://[tuapp].vercel.app
TIMEZONE=Europe/Madrid
```

### 3. Configurar Supabase

Ejecuta este SQL en tu proyecto Supabase:

```sql
-- Tabla de suscriptores
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  status TEXT CHECK (status IN ('pending','active','unsubscribed','bounced','spam')) DEFAULT 'pending',
  token_hash TEXT,
  consent_ts TIMESTAMPTZ,
  source TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  last_sent_at TIMESTAMPTZ,
  bounce_reason TEXT
);

-- Tabla de newsletters
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  preheader TEXT,
  source_url TEXT,
  content_md TEXT,
  html TEXT,
  status TEXT CHECK (status IN ('draft','scheduled','sent','failed')) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de envíos
CREATE TABLE sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id),
  subscriber_id UUID REFERENCES subscribers(id),
  status TEXT CHECK (status IN ('queued','sent','bounced','spam','unsub')) DEFAULT 'queued',
  provider_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- Habilitar RLS
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_read_sent ON issues FOR SELECT USING (status='sent');
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sends ENABLE ROW LEVEL SECURITY;
```

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

## 📧 Configuración de SendGrid

1. Crea cuenta en [SendGrid](https://sendgrid.com)
2. Verifica tu dominio o usa Single Sender
3. Genera API Key con permisos de "Mail Send"
4. Configura webhook para rebotes/bajas (opcional)

## 🕐 Cron Job

El newsletter se programa automáticamente para **domingos a las 08:00 UTC** (09:00 Madrid invierno, 10:00 verano).

Configuración en `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/send-scheduled",
      "schedule": "0 8 * * 0"
    }
  ]
}
```

## 📱 Uso

### Panel Admin
- **Login**: `/admin/login`
- **Dashboard**: `/admin`
- **Suscriptores**: `/admin/subscribers`
- **Newsletters**: `/admin/issues`

### Funcionalidades
1. **Pegar contenido MD/HTML** en `/admin/issues/new`
2. **Previsualizar** antes de enviar
3. **Enviar ahora** o **Programar** para domingo
4. **Importar/Exportar** suscriptores en CSV

### Límites Gratuitos
- **SendGrid**: 100 emails/día
- **Supabase**: 500MB, 50,000 filas
- **Vercel**: 100GB bandwidth

## 🔒 Seguridad

- **RLS** activo en todas las tablas
- **CSRF** en formularios admin
- **Rate limiting** en APIs
- **Honeypot** en suscripciones
- **Cookies httpOnly** para sesiones

## 🚨 Troubleshooting

### Errores comunes:
- **"Cannot find module"**: Ejecuta `pnpm install`
- **"ADMIN_PASSWORD not configured"**: Verifica `.env.local`
- **"SendGrid API key invalid"**: Verifica API key y permisos
- **"Supabase connection failed"**: Verifica URL y claves

### Logs:
```bash
# Ver logs de Vercel
vercel logs

# Logs locales
pnpm dev
```

## 📚 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   ├── admin/             # Panel admin
│   └── globals.css        # Estilos globales
├── lib/                   # Utilidades
│   ├── supabase.ts        # Cliente Supabase
│   ├── sendgrid.ts        # Config SendGrid
│   └── mjml.ts           # Compilador MJML
└── components/            # Componentes React
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea rama: `git checkout -b feature/nueva-funcionalidad`
3. Commit: `git commit -m 'Añadir funcionalidad'`
4. Push: `git push origin feature/nueva-funcionalidad`
5. Abre Pull Request

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🆘 Soporte

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/markets-finance-newsletter/issues)
- **Documentación**: [Wiki](https://github.com/tu-usuario/markets-finance-newsletter/wiki)

---

**Nota**: Esta plataforma está diseñada para ser **100% gratuita**. Si necesitas escalar más allá de los límites gratuitos, considera alternativas como SES, Mailgun, o planes de pago.
