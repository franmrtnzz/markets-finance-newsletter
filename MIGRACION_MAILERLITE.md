# 📧 Guía de Migración: SendGrid → MailerLite

Esta guía te ayudará a completar la migración de SendGrid a MailerLite paso a paso.

## ✅ Cambios Realizados

La migración técnica ya está completa. Se han realizado los siguientes cambios:

1. ✅ Creada nueva librería `src/lib/mailerlite.ts` para reemplazar `sendgrid.ts`
2. ✅ Actualizados todos los archivos que usaban SendGrid para usar MailerLite
3. ✅ Eliminada la dependencia `@sendgrid/mail` del `package.json`
4. ✅ Eliminado el webhook de SendGrid (`src/app/api/webhook/sendgrid/route.ts`)
5. ✅ Actualizadas las variables de entorno en `env.example`
6. ✅ Actualizada la documentación en `README.md`

## 🔑 Pasos para Obtener las Credenciales de MailerLite

### Paso 1: Crear Cuenta en MailerLite

1. Ve a [https://www.mailerlite.com](https://www.mailerlite.com)
2. Crea una cuenta gratuita (incluye hasta 1,000 suscriptores y 12,000 emails/mes)
3. Completa el proceso de verificación

### Paso 2: Obtener tu API Key

1. Inicia sesión en tu cuenta de MailerLite
2. Ve a **Settings** (Configuración) → **Integrations** (Integraciones) → **Developers** (Desarrolladores)
3. O si no encuentras esa opción, busca en el menú: **Integrations** → **API**
4. Crea una nueva API Key o copia la existente
5. **Guarda esta API Key** - la necesitarás para la variable `MAILERLITE_API_KEY`

### Paso 3: Configurar Email Remitente

1. Ve a **Settings** → **Sending** (Envío)
2. Configura tu dominio (opcional pero recomendado para mejor entregabilidad)
   - Si no tienes un dominio verificado, puedes usar el email por defecto de MailerLite
3. Anota el email remitente que vas a usar para `MAILERLITE_FROM_EMAIL`
4. El nombre remitente puede ser "Markets & Finance" o el que prefieras

### Paso 4: (Opcional) Crear un Grupo en MailerLite

Si quieres organizar tus suscriptores en un grupo específico:

1. Ve a **Subscribers** (Suscriptores) → **Groups** (Grupos)
2. Crea un nuevo grupo (por ejemplo: "Newsletter Subscribers")
3. Copia el ID del grupo (suele estar en la URL o en la configuración del grupo)
4. Úsalo para la variable `MAILERLITE_GROUP_ID` (opcional)

## 🔧 Configurar Variables de Entorno

Actualiza tu archivo `.env.local` (o las variables de entorno en Vercel) con:

```env
# MailerLite Configuration
MAILERLITE_API_KEY=tu_api_key_aqui
MAILERLITE_FROM_EMAIL=noreply@tudominio.com
MAILERLITE_FROM_NAME=Markets & Finance
# Opcional: ID del grupo de MailerLite
# MAILERLITE_GROUP_ID=tu_group_id
```

**⚠️ IMPORTANTE:** Reemplaza:
- `tu_api_key_aqui` con tu API Key de MailerLite
- `noreply@tudominio.com` con tu email remitente
- `tu_group_id` con el ID del grupo (si decidiste usar uno)

## 🚀 Instalación y Pruebas

### 1. Instalar/Actualizar Dependencias

```bash
# Eliminar la dependencia antigua de SendGrid (si aún está instalada)
pnpm remove @sendgrid/mail

# Instalar dependencias (no hay nuevas dependencias, MailerLite usa fetch nativo)
pnpm install
```

### 2. Probar la Integración

1. **Ejecuta el proyecto en desarrollo:**
   ```bash
   pnpm dev
   ```

2. **Prueba el envío de un newsletter:**
   - Inicia sesión en el panel de administración
   - Ve a la sección de envío de newsletters
   - Crea y envía un newsletter de prueba
   - Verifica que los emails lleguen correctamente

3. **Revisa los logs:**
   - Los logs mostrarán el progreso del envío
   - Si hay errores, los verás en la consola

## 📊 Cómo Funciona la Nueva Integración

### Diferencias con SendGrid

1. **MailerLite usa Campañas**: A diferencia de SendGrid que envía emails individuales directamente, MailerLite crea una campaña y la envía a un grupo de suscriptores.

2. **Sincronización de Suscriptores**: Cuando envías un newsletter:
   - Los suscriptores se añaden automáticamente a MailerLite (si no existen)
   - Se crea una campaña con el contenido del newsletter
   - La campaña se envía a todos los suscriptores

3. **Gestión de Grupos**: Si especificas un `MAILERLITE_GROUP_ID`, los suscriptores se añadirán a ese grupo. Si no, se añadirán a tu lista general.

### Ventajas de MailerLite

- ✅ **Gratis** hasta 1,000 suscriptores y 12,000 emails/mes
- ✅ Interfaz visual para gestionar campañas
- ✅ Estadísticas de apertura y clics
- ✅ Gestión centralizada de suscriptores
- ✅ API REST completa

### Limitaciones

- ⚠️ No tiene API de emails transaccionales directa como SendGrid (usa campañas)
- ⚠️ Los emails se envían como campañas (pueden aparecer en la sección de marketing de algunos clientes de email)
- ⚠️ Para emails individuales transaccionales, considera usar otro servicio

## 🐛 Solución de Problemas

### Error: "MAILERLITE_API_KEY no está configurada"

- Verifica que la variable de entorno esté correctamente configurada
- Asegúrate de haber reiniciado el servidor después de añadir la variable

### Error: "Error creando campaña en MailerLite"

- Verifica que tu API Key sea correcta y tenga los permisos necesarios
- Revisa que el formato del HTML del newsletter sea válido
- Verifica los logs para más detalles del error

### Los emails no llegan

- Verifica que los suscriptores se hayan añadido correctamente a MailerLite
- Revisa la carpeta de spam
- Verifica que el dominio remitente esté verificado en MailerLite (recomendado)

### Error 401 (No autorizado)

- Tu API Key puede ser incorrecta o haber expirado
- Genera una nueva API Key en MailerLite y actualiza la variable de entorno

## 📝 Notas Adicionales

- Los suscriptores existentes en tu base de datos de Supabase se sincronizarán automáticamente con MailerLite cuando envíes el primer newsletter
- Puedes gestionar tus suscriptores tanto desde tu aplicación como desde el panel de MailerLite
- Si eliminas un suscriptor desde MailerLite, no se eliminará automáticamente de tu base de datos (y viceversa)

## 🔄 Desactivar SendGrid

Una vez que hayas verificado que todo funciona correctamente con MailerLite:

1. **Prueba exhaustivamente** el envío de newsletters
2. **Verifica** que los emails lleguen correctamente
3. **Revisa** los logs para asegurarte de que no hay errores
4. **Cancela tu suscripción a SendGrid** para ahorrar dinero

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs del servidor para más detalles
2. Consulta la documentación de MailerLite: [https://developers.mailerlite.com/](https://developers.mailerlite.com/)
3. Verifica que todas las variables de entorno estén correctamente configuradas

---

**¡Migración completada! 🎉** Ahora estás usando MailerLite gratuito en lugar de SendGrid.

