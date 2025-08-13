#!/bin/bash

echo "🚀 Markets & Finance Newsletter - Instalador"
echo "=============================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado."
    echo "📥 Instalando Node.js 22..."
    
    # Intentar con Homebrew
    if command -v brew &> /dev/null; then
        brew install node@22
        brew link node@22 --force
    else
        echo "❌ Homebrew no está instalado."
        echo "📥 Instalando Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        echo "📥 Instalando Node.js 22..."
        brew install node@22
        brew link node@22 --force
    fi
else
    NODE_VERSION=$(node --version)
    echo "✅ Node.js ya está instalado: $NODE_VERSION"
fi

# Verificar versión de Node.js
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    echo "❌ Se requiere Node.js 22 o superior. Versión actual: $(node --version)"
    echo "📥 Actualizando Node.js..."
    if command -v brew &> /dev/null; then
        brew upgrade node
    fi
fi

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "📥 Instalando pnpm..."
    npm install -g pnpm
else
    echo "✅ pnpm ya está instalado: $(pnpm --version)"
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    if [ -f env.local ]; then
        cp env.local .env.local
        echo "✅ Archivo .env.local creado desde env.local"
    else
        echo "⚠️  Archivo env.local no encontrado. Crea .env.local manualmente."
    fi
else
    echo "✅ Archivo .env.local ya existe"
fi

# Verificar configuración
echo ""
echo "🔍 Verificando configuración..."
if [ -f .env.local ]; then
    echo "✅ Archivo .env.local encontrado"
    
    # Verificar variables críticas
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        echo "✅ Supabase URL configurada"
    else
        echo "❌ Supabase URL no configurada"
    fi
    
    if grep -q "SENDGRID_API_KEY" .env.local; then
        echo "✅ SendGrid API Key configurada"
    else
        echo "❌ SendGrid API Key no configurada"
    fi
    
    if grep -q "ADMIN_PASSWORD" .env.local; then
        echo "✅ Contraseña de admin configurada"
    else
        echo "❌ Contraseña de admin no configurada"
    fi
else
    echo "❌ Archivo .env.local no encontrado"
fi

echo ""
echo "📋 Próximos pasos:"
echo "1. Configura la base de datos en Supabase usando supabase-setup.sql"
echo "2. Verifica que todas las variables de entorno estén configuradas"
echo "3. Ejecuta 'pnpm dev' para iniciar el servidor de desarrollo"
echo ""
echo "🎉 ¡Instalación completada!"
echo ""
echo "Para iniciar: pnpm dev"
echo "Para construir: pnpm build"
echo "Para test: pnpm run dry-run" 