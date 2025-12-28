// Script para probar el envío de newsletter solo a tu email
// Uso: node test-newsletter.js

require('dotenv').config({ path: '.env.local' });

const BASE_URL = process.env.BASE_URL || 'https://www.marketsfinancenewsletter.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error('❌ ADMIN_PASSWORD no está configurado en .env.local');
  process.exit(1);
}

async function testNewsletter() {
  try {
    // 1. Login para obtener la sesión
    console.log('🔐 Iniciando sesión...');
    const loginResponse = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ password: ADMIN_PASSWORD })
    });

    if (!loginResponse.ok) {
      const error = await loginResponse.text();
      console.error('❌ Error en login:', error);
      process.exit(1);
    }

    const cookies = loginResponse.headers.get('set-cookie');
    if (!cookies) {
      console.error('❌ No se recibieron cookies de sesión');
      process.exit(1);
    }

    console.log('✅ Sesión iniciada\n');

    // 2. Enviar email de prueba
    console.log('📧 Enviando email de prueba...');
    const testResponse = await fetch(`${BASE_URL}/api/admin/newsletter/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        title: 'Newsletter de Prueba - MailerLite',
        preheader: 'Verificando integración con MailerLite',
        content: `
          <h2>¡Hola!</h2>
          <p>Este es un email de prueba para verificar que la integración con MailerLite funciona correctamente.</p>
          <p>Si recibes este email, significa que:</p>
          <ul>
            <li>✅ La API de MailerLite está configurada correctamente</li>
            <li>✅ Las variables de entorno están bien configuradas</li>
            <li>✅ Los emails se pueden enviar exitosamente</li>
            <li>✅ La migración de SendGrid a MailerLite fue exitosa</li>
          </ul>
          <p><strong>Este es solo un email de prueba.</strong> Los suscriptores reales NO recibieron este email.</p>
          <p>¡Todo está funcionando correctamente! 🎉</p>
        `,
        testEmail: 'francervantesmartinez2004@gmail.com'
      })
    });

    const result = await testResponse.json();

    if (testResponse.ok && result.success) {
      console.log('✅ Email de prueba enviado exitosamente!');
      console.log(`📧 Destinatario: ${result.recipient}`);
      console.log(`📝 Message ID: ${result.messageId}`);
      console.log(`\n💡 Revisa tu bandeja de entrada: ${result.recipient}`);
      console.log('   (También revisa la carpeta de spam si no lo ves)');
    } else {
      console.error('❌ Error enviando email de prueba:', result.error || result);
      process.exit(1);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testNewsletter();

