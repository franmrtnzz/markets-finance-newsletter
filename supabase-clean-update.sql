-- Markets & Finance Newsletter - Actualización Limpia
-- Ejecuta este SQL en tu proyecto Supabase (SQL Editor)

-- 1. Verificar estructura actual
SELECT 
  table_name, 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('subscribers', 'issues')
ORDER BY table_name, ordinal_position;

-- 2. Actualizar tabla subscribers si es necesario
DO $$ 
BEGIN
  -- Agregar columna is_active si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscribers' AND column_name = 'is_active') THEN
    ALTER TABLE subscribers ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;
  
  -- Agregar columna unsubscribe_token si no existe
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'subscribers' AND column_name = 'unsubscribe_token') THEN
    ALTER TABLE subscribers ADD COLUMN unsubscribe_token TEXT UNIQUE DEFAULT gen_random_uuid()::text;
  END IF;
  
  -- Renombrar created_at a subscribed_at si es necesario
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'subscribers' AND column_name = 'created_at') 
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'subscribers' AND column_name = 'subscribed_at') THEN
    ALTER TABLE subscribers RENAME COLUMN created_at TO subscribed_at;
  END IF;
  
  -- Actualizar suscriptores existentes
  UPDATE subscribers SET is_active = true WHERE is_active IS NULL;
  UPDATE subscribers SET unsubscribe_token = gen_random_uuid()::text WHERE unsubscribe_token IS NULL;
  
END $$;

-- 3. Verificar políticas de seguridad
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('subscribers', 'issues');

-- 4. Crear políticas si no existen
DO $$
BEGIN
  -- Política para suscripciones públicas
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'public_subscribe') THEN
    CREATE POLICY public_subscribe ON subscribers FOR INSERT WITH CHECK (true);
  END IF;
  
  -- Política para lectura de suscriptores activos
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'public_read_active') THEN
    CREATE POLICY public_read_active ON subscribers FOR SELECT USING (is_active = true);
  END IF;
  
  -- Política para admin (acceso completo)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'subscribers' AND policyname = 'admin_subscribers') THEN
    CREATE POLICY admin_subscribers ON subscribers FOR ALL USING (true);
  END IF;
END $$;

-- 5. Verificar estructura final
SELECT 
  'subscribers' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'subscribers'
UNION ALL
SELECT 
  'issues' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'issues'
ORDER BY table_name, ordinal_position;

-- 6. Mostrar estadísticas actuales
SELECT 
  'Suscriptores' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN is_active THEN 1 END) as activos,
  COUNT(CASE WHEN NOT is_active THEN 1 END) as inactivos
FROM subscribers
UNION ALL
SELECT 
  'Newsletters' as tipo,
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as borradores,
  COUNT(CASE WHEN status = 'sent' THEN 1 END) as enviados
FROM issues; 