-- ============================================================================
-- Markets & Finance · Migración 0003 · Noticias candidatas para newsletter
-- ============================================================================
-- Tabla para gestionar noticias recopiladas a lo largo del cuatrimestre
-- que son candidatas a aparecer en la newsletter cuatrimestral de Inversus Group.
-- ============================================================================

create table if not exists public.news_candidates (
  id              uuid primary key default uuid_generate_v4(),

  -- Información de la noticia
  title           text not null,
  source          text,                          -- Medio / fuente
  url             text,                          -- Enlace original
  published_date  date,                          -- Fecha de publicación original
  saved_at        timestamptz not null default now(), -- Fecha en que se guarda

  -- Clasificación
  category        text not null default 'economia_general'
                    check (category in ('economia_general', 'sector_financiero')),
  scope           text not null default 'global'
                    check (scope in ('espana', 'europa', 'eeuu', 'global', 'otro')),
  quarter         text not null,                 -- Ej: "2026-Q1", "2026-Q2", etc.
  tags            text[] default '{}',

  -- Contenido editorial
  summary         text,                          -- Breve resumen
  relevance       text,                          -- Por qué es relevante para la newsletter
  editorial_idea  text,                          -- Ideas para comentario de Inversus Group
  importance      text,                          -- Explicación de importancia (preparación newsletter)
  editorial_angle text,                          -- Enfoque editorial propuesto
  inversus_link   text,                          -- Conexión con Inversus Group

  -- Evaluación
  rating          integer default 0 check (rating >= 0 and rating <= 5),
  status          text not null default 'pendiente'
                    check (status in ('pendiente', 'candidata', 'descartada', 'seleccionada')),
  selected_for    text check (selected_for is null or selected_for in ('economia_general', 'sector_financiero')),

  -- Timestamps
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices para búsquedas frecuentes
create index if not exists news_candidates_category_idx
  on public.news_candidates (category);

create index if not exists news_candidates_quarter_idx
  on public.news_candidates (quarter);

create index if not exists news_candidates_status_idx
  on public.news_candidates (status);

create index if not exists news_candidates_saved_at_idx
  on public.news_candidates (saved_at desc);

create index if not exists news_candidates_rating_idx
  on public.news_candidates (rating desc);

-- Trigger updated_at automático
drop trigger if exists trg_news_candidates_updated on public.news_candidates;
create trigger trg_news_candidates_updated before update on public.news_candidates
  for each row execute function public.set_updated_at();

-- RLS: solo acceso vía service_role (admin)
alter table public.news_candidates enable row level security;
-- No se crean políticas públicas — solo service_role accede.
