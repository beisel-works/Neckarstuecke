create table if not exists public.edition_numbers (
  id uuid primary key default gen_random_uuid(),
  print_id uuid not null references public.prints(id) on delete cascade,
  order_id uuid references public.orders(id) on delete set null,
  edition_number integer not null check (edition_number between 1 and 150),
  created_at timestamptz not null default now()
);

create unique index if not exists edition_numbers_unique_idx
  on public.edition_numbers (print_id, edition_number);

create index if not exists edition_numbers_print_id_idx
  on public.edition_numbers (print_id);

create index if not exists edition_numbers_order_id_idx
  on public.edition_numbers (order_id)
  where order_id is not null;

alter table public.edition_numbers enable row level security;

create or replace view public.editions_remaining_per_print as
select
  prints.id as print_id,
  greatest(150 - count(edition_numbers.id), 0)::integer as editions_remaining
from public.prints
left join public.edition_numbers
  on edition_numbers.print_id = prints.id
group by prints.id;

grant select on public.editions_remaining_per_print to anon, authenticated;

create or replace function public.assign_edition_number(
  p_print_id uuid,
  p_order_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_number integer;
  edition_limit constant integer := 150;
begin
  perform 1
  from public.prints
  where id = p_print_id
  for update;

  select coalesce(max(edition_number), 0) + 1
  into next_number
  from public.edition_numbers
  where print_id = p_print_id;

  if next_number > edition_limit then
    raise exception 'EDITION_EXHAUSTED';
  end if;

  insert into public.edition_numbers (print_id, order_id, edition_number)
  values (p_print_id, p_order_id, next_number);

  if next_number >= edition_limit then
    update public.print_variants
    set in_stock = false
    where print_id = p_print_id;
  end if;

  return next_number;
end;
$$;

revoke all on function public.assign_edition_number(uuid, uuid) from public, anon, authenticated;
grant execute on function public.assign_edition_number(uuid, uuid) to service_role;
