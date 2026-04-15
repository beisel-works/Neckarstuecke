-- ============================================================
-- Migration 001: prints and print_variants tables
-- ============================================================

-- Prints: core content objects for the storefront catalog.
create table if not exists prints (
  id                    uuid primary key default gen_random_uuid(),
  slug                  text not null unique,
  title                 text not null,
  location              text not null,
  collection            text not null default 'kollektion-01',
  description           text not null default '',
  emotional_narrative   text not null default '',
  material_description  text not null default '',
  image_web_preview_url text,
  image_thumbnail_url   text,
  image_og_url          text,
  available             boolean not null default true,
  created_at            timestamptz not null default now()
);

-- Print variants: size × format × price combinations per print.
create table if not exists print_variants (
  id          uuid primary key default gen_random_uuid(),
  print_id    uuid not null references prints(id) on delete cascade,
  size_label  text not null,         -- e.g. "30×40 cm"
  width_mm    integer not null,      -- e.g. 300
  height_mm   integer not null,      -- e.g. 400
  format      text not null check (format in ('print', 'framed')),
  price_cents integer not null check (price_cents > 0),
  in_stock    boolean not null default true
);

-- Indexes for common query patterns
create index if not exists prints_collection_idx  on prints(collection);
create index if not exists prints_available_idx   on prints(available);
create index if not exists variants_print_id_idx  on print_variants(print_id);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table prints         enable row level security;
alter table print_variants enable row level security;

-- Public anonymous read access to available prints
create policy "anon can read available prints"
  on prints for select
  to anon
  using (available = true);

-- Public anonymous read access to all variants (availability controlled via print)
create policy "anon can read print variants"
  on print_variants for select
  to anon
  using (true);
