create table if not exists public.print_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  delivery_country text not null,
  message text not null default '',
  print_slug text not null,
  variant_label text not null,
  price_hint text,
  status text not null default 'new',
  session_id text
);

alter table public.print_inquiries enable row level security;

create policy "anon can insert print inquiries"
  on public.print_inquiries
  for insert
  to anon, authenticated
  with check (true);
