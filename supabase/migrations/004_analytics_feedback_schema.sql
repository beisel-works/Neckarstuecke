-- ============================================================
-- Migration 004: analytics and customer feedback
-- ============================================================

create table if not exists analytics_events (
  id         uuid primary key default gen_random_uuid(),
  event_name text not null,
  page       text not null,
  motif_slug text,
  session_id text not null,
  idempotency_key text,
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_event_name_idx
  on analytics_events (event_name);

create index if not exists analytics_events_page_idx
  on analytics_events (page);

create index if not exists analytics_events_session_id_idx
  on analytics_events (session_id);

create index if not exists analytics_events_created_at_idx
  on analytics_events (created_at desc);

create unique index if not exists analytics_events_idempotency_key_idx
  on analytics_events (idempotency_key)
  where idempotency_key is not null;

alter table analytics_events enable row level security;

create table if not exists customer_feedback (
  id                   uuid primary key default gen_random_uuid(),
  session_id           text not null,
  page                 text not null,
  order_reference      text,
  email                text,
  resonance_rating     integer not null check (resonance_rating between 1 and 5),
  message              text not null default '',
  submitted_at         timestamptz not null default now()
);

create index if not exists customer_feedback_session_id_idx
  on customer_feedback (session_id);

create index if not exists customer_feedback_submitted_at_idx
  on customer_feedback (submitted_at desc);

alter table customer_feedback enable row level security;
