do $$ begin
  create type public.coa_status as enum (
    'pending',
    'printed',
    'dispatched'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.certificates_of_authenticity (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  edition_number integer not null,
  print_slug text not null,
  format_label text not null,
  buyer_name text not null,
  pdf_storage_path text,
  coa_status public.coa_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists certificates_of_authenticity_order_item_edition_idx
  on public.certificates_of_authenticity (order_item_id, edition_number);

alter table public.certificates_of_authenticity enable row level security;

create policy "authenticated users can read own coa certificates"
  on public.certificates_of_authenticity
  for select
  to authenticated
  using (
    order_item_id in (
      select public.order_items.id
      from public.order_items
      inner join public.orders on public.orders.id = public.order_items.order_id
      where public.orders.customer_email = auth.email()
    )
  );

create or replace trigger certificates_of_authenticity_updated_at
  before update on public.certificates_of_authenticity
  for each row execute function public.touch_updated_at();
