# 🚀 Configuración Paso a Paso - Markets & Finance Newsletter

## 📋 Checklist de Recursos (OBLIGATORIO)

Antes de continuar, asegúrate de tener:

- ✅ **Supabase**: URL, Anon Key, Service Role Key
- ✅ **SendGrid**: API Key
- ✅ **Admin Password**: Contraseña para el panel admin
- ✅ **Base URL**: URL de tu aplicación Vercel

## 🎯 Paso 1: Configurar Supabase

1. **Ve a [supabase.com](https://supabase.com)**
2. **Crea un nuevo proyecto** (gratis)
3. **Ve a SQL Editor**
4. **Copia y pega** el contenido de `supabase-setup.sql`
5. **Ejecuta el SQL**
6. **Copia las claves** de Settings > API

## 🎯 Paso 2: Configurar SendGrid

1. **Ve a [sendgrid.com](https://sendgrid.com)**
2. **Crea cuenta gratuita**
3. **Ve a Settings > API Keys**
4. **Crea nueva API Key** con permisos "Mail Send"
5. **Copia la API Key**

## 🎯 Paso 3: Instalar Dependencias

```bash
# Opción A: Script automático (recomendado)
./install.sh

# Opción B: Manual
# 1. Instalar Node.js 22+
# 2. Instalar pnpm: npm install -g pnpm
# 3. Instalar dependencias: pnpm install
```

## 🎯 Paso 4: Configurar Variables de Entorno

1. **Copia `env.local` a `.env.local`**
2. **Verifica que todas las variables estén configuradas**
3. **Ajusta `BASE_URL`** a tu dominio de Vercel

## 🎯 Paso 5: Probar la Aplicación

```bash
# Desarrollo local
pnpm dev

# Construir para producción
pnpm build

# Test básico
pnpm run dry-run
```

## 🎯 Paso 6: Desplegar en Vercel

1. **Conecta tu repositorio** a Vercel
2. **Configura las variables de entorno** en Vercel
3. **Deploy automático** en cada push

## 🔍 Verificación

### ✅ Supabase
- [ ] Tablas creadas (`subscribers`, `issues`, `sends`)
- [ ] RLS habilitado
- [ ] Políticas de seguridad configuradas

### ✅ SendGrid
- [ ] API Key válida
- [ ] Permisos "Mail Send" habilitados
- [ ] Webhook configurado (opcional)

### ✅ Aplicación
- [ ] `pnpm dev` funciona
- [ ] Página principal carga
- [ ] Login admin funciona
- [ ] APIs responden correctamente

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
pnpm install
```

### Error: "ADMIN_PASSWORD not configured"
Verifica que `.env.local` existe y tiene `ADMIN_PASSWORD`

### Error: "SendGrid API key invalid"
Verifica la API Key y permisos en SendGrid

### Error: "Supabase connection failed"
Verifica URL y claves en Supabase

## 📱 URLs Importantes

- **Página principal**: `/`
- **Login admin**: `/admin/login`
- **Dashboard**: `/admin`
- **Suscriptores**: `/admin/subscribers`
- **Newsletters**: `/admin/issues`

## 🕐 Cron Job

El newsletter se programa automáticamente para **domingos a las 08:00 UTC**:
- **Invierno**: 09:00 Madrid
- **Verano**: 10:00 Madrid

## 💰 Costes

- **Supabase**: 0€ (500MB, 50,000 filas)
- **SendGrid**: 0€ (100 emails/día)
- **Vercel**: 0€ (100GB bandwidth)
- **Total**: **0€/mes**

## 🆘 Soporte

Si tienes problemas:
1. **Revisa los logs**: `pnpm dev`
2. **Verifica la configuración**: Variables de entorno
3. **Consulta la documentación**: README.md
4. **Abre un issue** en GitHub

---

**¡Listo!** Tu plataforma de newsletter está configurada y funcionando. 🎉 