# 🧪 Cómo Probar el Envío de Newsletter

Has creado un endpoint de prueba que **SOLO envía a tu email personal**, sin afectar a los suscriptores reales.

## Opción 1: Usando el Script de Prueba (Recomendado)

He creado un script simple que puedes ejecutar:

```bash
node test-newsletter.js
```

Este script:
- ✅ Inicia sesión automáticamente
- ✅ Envía un email de prueba a `francervantesmartinez2004@gmail.com`
- ✅ Usa un grupo temporal en MailerLite (solo tu email)
- ✅ NO afecta a los suscriptores reales

## Opción 2: Desde el Navegador (Postman/Insomnia)

Si prefieres probar manualmente:

**URL:** `https://www.marketsfinancenewsletter.com/api/admin/newsletter/test`

**Método:** `POST`

**Headers:**
```
Content-Type: application/json
Cookie: admin_session=authenticated
```

**Body (JSON):**
```json
{
  "title": "Newsletter de Prueba",
  "preheader": "Probando MailerLite",
  "content": "<h2>Contenido de prueba</h2><p>Este es un email de prueba.</p>",
  "testEmail": "francervantesmartinez2004@gmail.com"
}
```

**Nota:** Necesitas estar autenticado. Puedes iniciar sesión en `/admin/login` primero y copiar la cookie `admin_session`.

## Opción 3: Desde la Consola del Navegador

Si estás en el panel de administración:

1. Abre la consola del navegador (F12)
2. Ejecuta:

```javascript
fetch('/api/admin/newsletter/test', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Newsletter de Prueba - MailerLite',
    preheader: 'Verificando integración',
    content: '<h2>¡Hola!</h2><p>Este es un email de prueba.</p>',
    testEmail: 'francervantesmartinez2004@gmail.com'
  })
})
.then(r => r.json())
.then(data => console.log('Resultado:', data))
.catch(err => console.error('Error:', err));
```

## ✅ Qué Esperar

Si todo funciona correctamente, deberías:

1. ✅ Ver un mensaje de éxito en la consola/respuesta
2. ✅ Recibir un email en `francervantesmartinez2004@gmail.com`
3. ✅ El email tendrá `[PRUEBA]` en el asunto
4. ✅ El email tendrá un banner amarillo indicando que es de prueba
5. ✅ Los suscriptores reales NO recibirán este email

## 🔍 Verificar en MailerLite

Después de enviar:

1. Ve a tu cuenta de MailerLite
2. Revisa **Campaigns** - deberías ver una campaña nueva
3. Revisa **Subscribers** - tu email de prueba debería estar ahí (en el grupo temporal o en el grupo principal)
4. Los grupos temporales se eliminan automáticamente después de unos segundos

## ⚠️ Importante

- Este endpoint **SOLO envía a tu email** (o al email que especifiques en `testEmail`)
- **NO afecta a los suscriptores reales**
- Usa grupos temporales que se eliminan automáticamente
- Las campañas de prueba se crean en MailerLite pero solo se envían a tu email

## 🚀 Cuando Estés Listo para Producción

Una vez que verifiques que todo funciona:

1. ✅ Confirma que recibiste el email correctamente
2. ✅ Verifica que el formato se ve bien
3. ✅ Revisa los logs en Vercel para asegurar que no hay errores
4. ✅ Cuando estés listo, usa el endpoint normal `/api/admin/newsletter/send` para enviar a todos los suscriptores

---

**¡Listo para probar!** Ejecuta `node test-newsletter.js` cuando estés listo. 🎉

