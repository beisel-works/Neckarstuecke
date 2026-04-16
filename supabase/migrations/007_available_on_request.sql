alter table public.print_variants
  add column if not exists available_on_request boolean not null default false;
