-- ============================================================================
-- Markets & Finance · Migración 0002 · Tabla settings (key-value)
-- ============================================================================

create table if not exists public.settings (
  key        text primary key,
  value      text not null default '',
  updated_at timestamptz not null default now()
);

-- Sin RLS: solo se accede con service_role desde el admin
alter table public.settings enable row level security;
-- No se crean políticas públicas — solo service_role (que ignora RLS) accede.
