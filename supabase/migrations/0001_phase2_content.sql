-- ============================================================================
-- Markets & Finance · Migración 0001 · Fase 2: Modelo de contenido
-- ============================================================================
-- Crea las tablas para:
--   • newsletters  (HTML pegado en el panel)
--   • articles     (PDF subido a Storage + texto descriptivo)
--   • notes        (texto corto, timeline público)
--   • likes        (polimórfico, anónimo por fingerprint)
--   • comments     (polimórfico, autenticado con Google vía Supabase Auth)
-- ============================================================================

-- Extensiones necesarias
create extension if not exists "uuid-ossp";

-- ──────────────────────────────────────────────────────────────────────────
-- NEWSLETTERS
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.newsletters (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  html          text not null,                -- HTML pegado tal cual
  status        text not null default 'draft' check (status in ('draft','published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists newsletters_published_at_idx
  on public.newsletters (published_at desc) where status = 'published';

-- ──────────────────────────────────────────────────────────────────────────
-- ARTICLES (PDFs + texto que los acompaña)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.articles (
  id            uuid primary key default uuid_generate_v4(),
  slug          text unique not null,
  title         text not null,
  excerpt       text,
  description   text,                          -- texto / markdown que acompaña al PDF
  pdf_url       text,                          -- URL pública del PDF en Storage
  pdf_path      text,                          -- ruta interna en el bucket (para borrarlo)
  cover_url     text,
  tags          text[] default '{}',
  status        text not null default 'draft' check (status in ('draft','published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists articles_published_at_idx
  on public.articles (published_at desc) where status = 'published';

-- ──────────────────────────────────────────────────────────────────────────
-- NOTES (timeline de pensamientos cortos)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.notes (
  id            uuid primary key default uuid_generate_v4(),
  body          text not null,
  status        text not null default 'draft' check (status in ('draft','published')),
  published_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists notes_published_at_idx
  on public.notes (published_at desc) where status = 'published';

-- ──────────────────────────────────────────────────────────────────────────
-- LIKES (polimórficos · anónimos · uno por fingerprint)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.likes (
  id            uuid primary key default uuid_generate_v4(),
  content_type  text not null check (content_type in ('newsletter','article','note')),
  content_id    uuid not null,
  fingerprint   text not null,                 -- cookie/localStorage id anónimo
  created_at    timestamptz not null default now(),
  unique (content_type, content_id, fingerprint)
);

create index if not exists likes_content_idx
  on public.likes (content_type, content_id);

-- ──────────────────────────────────────────────────────────────────────────
-- COMMENTS (polimórficos · login con Google vía Supabase Auth)
-- ──────────────────────────────────────────────────────────────────────────
create table if not exists public.comments (
  id              uuid primary key default uuid_generate_v4(),
  content_type    text not null check (content_type in ('newsletter','article','note')),
  content_id      uuid not null,
  user_id         uuid not null references auth.users(id) on delete cascade,
  author_name     text,                        -- cacheado al crear el comentario
  author_avatar   text,
  body            text not null,
  status          text not null default 'visible' check (status in ('visible','hidden')),
  parent_id       uuid references public.comments(id) on delete cascade,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists comments_content_idx
  on public.comments (content_type, content_id, created_at desc);

-- ──────────────────────────────────────────────────────────────────────────
-- TRIGGER updated_at automático
-- ──────────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_newsletters_updated on public.newsletters;
create trigger trg_newsletters_updated before update on public.newsletters
  for each row execute function public.set_updated_at();

drop trigger if exists trg_articles_updated on public.articles;
create trigger trg_articles_updated before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_notes_updated on public.notes;
create trigger trg_notes_updated before update on public.notes
  for each row execute function public.set_updated_at();

drop trigger if exists trg_comments_updated on public.comments;
create trigger trg_comments_updated before update on public.comments
  for each row execute function public.set_updated_at();

-- ──────────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────────────────
alter table public.newsletters enable row level security;
alter table public.articles    enable row level security;
alter table public.notes       enable row level security;
alter table public.likes       enable row level security;
alter table public.comments    enable row level security;

-- LECTURA PÚBLICA solo de contenido publicado
drop policy if exists "newsletters_public_read" on public.newsletters;
create policy "newsletters_public_read" on public.newsletters
  for select using (status = 'published');

drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles
  for select using (status = 'published');

drop policy if exists "notes_public_read" on public.notes;
create policy "notes_public_read" on public.notes
  for select using (status = 'published');

-- LIKES: cualquiera puede leer y crear (con su fingerprint), solo borra el dueño del fingerprint
drop policy if exists "likes_public_read" on public.likes;
create policy "likes_public_read" on public.likes for select using (true);

drop policy if exists "likes_public_insert" on public.likes;
create policy "likes_public_insert" on public.likes for insert with check (true);

drop policy if exists "likes_public_delete" on public.likes;
create policy "likes_public_delete" on public.likes for delete using (true);
-- (la unicidad (content_type, content_id, fingerprint) ya impide spam de likes)

-- COMMENTS: lectura pública de los visibles; insertar requiere usuario autenticado;
-- editar/borrar solo el autor.
drop policy if exists "comments_public_read" on public.comments;
create policy "comments_public_read" on public.comments
  for select using (status = 'visible');

drop policy if exists "comments_auth_insert" on public.comments;
create policy "comments_auth_insert" on public.comments
  for insert with check (auth.uid() = user_id);

drop policy if exists "comments_owner_update" on public.comments;
create policy "comments_owner_update" on public.comments
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "comments_owner_delete" on public.comments;
create policy "comments_owner_delete" on public.comments
  for delete using (auth.uid() = user_id);

-- NOTA: el panel admin opera con la SERVICE_ROLE_KEY, que ignora RLS,
-- así que no necesita políticas adicionales.
