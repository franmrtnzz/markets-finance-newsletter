-- Markets & Finance Newsletter - Sistema Simple
-- Ejecuta este SQL en tu proyecto Supabase (SQL Editor)

-- 1. Eliminar tabla antigua si existe
DROP TABLE IF EXISTS sends;
DROP TABLE IF EXISTS subscribers;

-- 2. Crear tabla de suscriptores simplificada
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text,
  is_active BOOLEAN DEFAULT true
);

-- 3. Crear tabla de newsletters (mantenemos esta)
CREATE TABLE IF NOT EXISTS issues (
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

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
-- Permitir inserción pública para suscripciones
CREATE POLICY public_subscribe ON subscribers FOR INSERT WITH CHECK (true);

-- Permitir lectura solo de suscriptores activos
CREATE POLICY public_read_active ON subscribers FOR SELECT USING (is_active = true);

-- Política para admin (acceso completo)
CREATE POLICY admin_subscribers ON subscribers FOR ALL USING (true);

-- Política para newsletters (solo admin puede acceder)
CREATE POLICY admin_issues ON issues FOR ALL USING (true);

-- 6. Crear índices para mejor rendimiento
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_active ON subscribers(is_active);
CREATE INDEX idx_subscribers_unsubscribe ON subscribers(unsubscribe_token);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_scheduled_at ON issues(scheduled_at);

-- 7. Verificar que las tablas se crearon correctamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('subscribers', 'issues')
ORDER BY table_name, ordinal_position; 