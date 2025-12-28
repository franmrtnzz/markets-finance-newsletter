# Markets & Finance Newsletter

Una plataforma moderna y completa para newsletters financieras, construida con Next.js 14, con gestión de suscriptores, panel de administración y envío automatizado de emails.

## ✨ Características Principales

- **🎯 Newsletter Profesional:** Sistema completo para crear y enviar newsletters financieras semanales
- **👥 Gestión de Suscriptores:** Sistema de suscripción/desuscripción con tokens seguros
- **🛠️ Panel de Administración:** Dashboard completo para gestionar suscriptores y newsletters
- **📧 Envío Automatizado:** Integración con MailerLite para envío masivo de emails (gratuito)
- **🎨 Diseño Responsive:** Interfaz moderna y profesional con Tailwind CSS
- **🔒 Seguridad:** Autenticación admin, protección CSRF, rate limiting y honeypot anti-spam
- **📊 Estadísticas en Tiempo Real:** Dashboard con métricas actualizadas automáticamente

## 🚀 Estado del Proyecto

**✅ COMPLETADO Y FUNCIONANDO**

- [x] Sistema de suscripción funcional
- [x] Panel de administración operativo
- [x] Dashboard con estadísticas en tiempo real
- [x] Envío de newsletters con MailerLite
- [x] Sistema de autenticación admin
- [x] Interfaz responsive y profesional
- [x] Base de datos Supabase configurada
- [x] Deploy en Vercel funcionando
- [x] Newsletter enviándose correctamente

## 🏗️ Arquitectura Técnica

### **Frontend**
- **Next.js 14** (App Router)
- **React 18** con TypeScript
- **Tailwind CSS** para estilos
- **Componentes responsive** y modernos

### **Backend**
- **Next.js API Routes**
- **Supabase** (PostgreSQL) para base de datos
- **MailerLite** para envío de emails (API gratuita)
- **Autenticación** con cookies httpOnly

### **Base de Datos**
- **Tabla subscribers:** Gestión de suscriptores
- **Tabla issues:** Almacenamiento de newsletters
- **Row Level Security** habilitado
- **Políticas de seguridad** configuradas

### **Deploy**
- **Vercel** con dominio personalizado
- **Variables de entorno** configuradas
- **Auto-deploy** desde GitHub

## 📱 Funcionalidades Implementadas

### **Para Suscriptores**
- ✅ Suscripción con email
- ✅ Confirmación automática
- ✅ Desuscripción con token seguro
- ✅ Recepción de newsletters semanales

### **Para Administradores**
- ✅ Login seguro con contraseña
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de suscriptores
- ✅ Creación y envío de newsletters
- ✅ Vista previa de newsletters
- ✅ Historial de envíos

### **Sistema de Emails**
- ✅ Plantillas HTML profesionales
- ✅ Envío masivo con MailerLite (gratuito hasta 12,000 emails/mes)
- ✅ Tracking de envíos
- ✅ Manejo de errores y reintentos

## 🎨 Características del Dashboard

- **Actualización automática** cada 30 segundos
- **Botón de actualización manual** con indicador visual
- **Estadísticas en tiempo real:**
  - Total de suscriptores
  - Suscriptores activos
  - Total de newsletters
  - Newsletters enviados
- **Interfaz intuitiva** y fácil de usar
- **Diseño responsive** para todos los dispositivos

## 🔧 Configuración del Entorno

### **Variables de Entorno Requeridas**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

# MailerLite
MAILERLITE_API_KEY=tu_mailerlite_api_key
MAILERLITE_FROM_EMAIL=noreply@tudominio.com
MAILERLITE_FROM_NAME=Markets & Finance
# Opcional: ID del grupo de MailerLite para organizar suscriptores
# MAILERLITE_GROUP_ID=tu_group_id

# Admin
ADMIN_PASSWORD=tu_contraseña_segura

# Aplicación
BASE_URL=https://tudominio.com
```

### **Instalación y Configuración**
```bash
# Clonar repositorio
git clone https://github.com/tuusuario/markets-finance-newsletter.git
cd markets-finance-newsletter

# Instalar dependencias
pnpm install

# Configurar variables de entorno
cp env.example .env.local
# Editar .env.local con tus credenciales

# Ejecutar en desarrollo
pnpm dev

# Construir para producción
pnpm build
```

## 📊 Estructura de la Base de Datos

### **Tabla: subscribers**
```sql
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  is_active BOOLEAN DEFAULT true
);
```

### **Tabla: issues**
```sql
CREATE TABLE issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  title TEXT,
  preheader TEXT,
  content_md TEXT,
  html TEXT,
  status TEXT CHECK (status IN ('draft','scheduled','sent','failed')) DEFAULT 'draft',
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🌐 URLs del Sistema

- **Página principal:** `/` - Formulario de suscripción
- **Admin login:** `/admin/login` - Acceso al panel
- **Dashboard:** `/admin` - Panel de administración
- **Gestión suscriptores:** `/admin/subscribers`
- **Crear newsletter:** `/admin/newsletter/send`
- **Gestionar newsletters:** `/admin/issues`

## 🔒 Seguridad Implementada

- **Autenticación admin** con contraseña segura
- **Cookies httpOnly** para sesiones
- **Protección CSRF** integrada
- **Rate limiting** en endpoints críticos
- **Honeypot anti-spam** en formularios
- **Row Level Security** en Supabase
- **Validación de entrada** en todos los endpoints

## 📈 Métricas y Rendimiento

- **Tiempo de carga:** < 2 segundos
- **Actualización automática:** Cada 30 segundos
- **Envío de emails:** Masivo y eficiente
- **Base de datos:** Consultas optimizadas
- **Frontend:** Componentes lazy-loaded

## 🚀 Deploy en Producción

### **Vercel (Recomendado)**
1. Conectar repositorio GitHub
2. Configurar variables de entorno
3. Deploy automático en cada push
4. Dominio personalizado configurado

### **Configuración de Dominio**
- **DNS:** Apuntar a Vercel
- **MailerLite:** Verificación de dominio (recomendado para mejor entregabilidad)
- **SSL:** Automático con Vercel

## 🎯 Casos de Uso

### **Newsletter Semanal**
- **Frecuencia:** Domingos 10:00-14:00 (hora española)
- **Contenido:** Análisis de mercados financieros
- **Formato:** HTML profesional y responsive
- **Audiencia:** Profesionales del sector financiero

### **Gestión de Suscriptores**
- **Suscripción:** Formulario web simple
- **Desuscripción:** Un clic con token seguro
- **Reactivación:** Automática para emails existentes
- **Limpieza:** Gestión de emails inactivos

## 🔮 Próximas Mejoras (Opcionales)

- [ ] Sistema de plantillas de newsletters
- [ ] Programación de envíos automáticos
- [ ] Analytics avanzados de engagement
- [ ] Integración con redes sociales
- [ ] Sistema de categorías de suscriptores
- [ ] A/B testing de newsletters

## 📞 Soporte y Mantenimiento

- **Documentación:** README completo y actualizado
- **Código:** Comentado y bien estructurado
- **Logs:** Sistema de logging para debugging
- **Monitoreo:** Endpoints de health check

## 🏆 Estado Final

**🎉 PROYECTO COMPLETADO EXITOSAMENTE**

El sistema está **100% funcional** y listo para uso en producción:
- ✅ Newsletter enviándose correctamente
- ✅ Dashboard operativo y actualizado
- ✅ Sistema de suscripciones funcionando
- ✅ Deploy en Vercel estable
- ✅ Base de datos configurada y segura
- ✅ Interfaz profesional y responsive

---

**Markets & Finance Newsletter** - Plataforma profesional para newsletters financieras

*Desarrollado con Next.js 14, Supabase y MailerLite*
