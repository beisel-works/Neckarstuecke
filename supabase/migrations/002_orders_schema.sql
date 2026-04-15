-- ============================================================
-- Migration 002: orders table
-- Stores confirmed purchases after Stripe checkout.session.completed webhook.
-- ============================================================

create table if not exists orders (
  id                        uuid primary key default gen_random_uuid(),
  stripe_session_id         text not null unique,
  stripe_payment_intent_id  text,
  status                    text not null default 'paid'
                              check (status in ('pending', 'paid', 'fulfilled', 'failed')),
  customer_email            text,
  shipping_address          jsonb,
  line_items                jsonb not null default '[]'::jsonb,
  total_cents               integer,
  currency                  text not null default 'eur',
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Index for idempotency checks and fulfillment pipeline queries
create index if not exists orders_stripe_session_id_idx on orders(stripe_session_id);
create index if not exists orders_status_idx            on orders(status);
create index if not exists orders_created_at_idx        on orders(created_at desc);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table orders enable row level security;

-- No anon access — orders are only written by the service role (webhook handler)
-- and read by authenticated admin users or fulfillment service.
-- Add authenticated policies when an admin dashboard is built.
