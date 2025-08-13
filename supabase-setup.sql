-- Markets & Finance Newsletter - Supabase Setup
-- Ejecuta este SQL en tu proyecto Supabase (SQL Editor)

-- 1. Crear tabla de suscriptores
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

-- 2. Crear tabla de newsletters
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

-- 3. Crear tabla de envíos
CREATE TABLE sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id UUID REFERENCES issues(id),
  subscriber_id UUID REFERENCES subscribers(id),
  status TEXT CHECK (status IN ('queued','sent','bounced','spam','unsub')) DEFAULT 'queued',
  provider_message_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- 4. Habilitar Row Level Security (RLS)
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sends ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
-- Permitir lectura pública solo de newsletters enviados
CREATE POLICY public_read_sent ON issues FOR SELECT USING (status='sent');

-- Política para suscriptores (solo admin puede acceder)
CREATE POLICY admin_subscribers ON subscribers FOR ALL USING (true);

-- Política para envíos (solo admin puede acceder)
CREATE POLICY admin_sends ON sends FOR ALL USING (true);

-- 6. Crear índices para mejor rendimiento
CREATE INDEX idx_subscribers_email ON subscribers(email);
CREATE INDEX idx_subscribers_status ON subscribers(status);
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_scheduled_at ON issues(scheduled_at);
CREATE INDEX idx_sends_issue_id ON sends(issue_id);
CREATE INDEX idx_sends_subscriber_id ON sends(subscriber_id);

-- 7. Verificar que las tablas se crearon correctamente
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('subscribers', 'issues', 'sends')
ORDER BY table_name, ordinal_position; 