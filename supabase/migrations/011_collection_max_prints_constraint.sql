-- ============================================================
-- Migration 003: enforce max 4 available prints per collection
-- ============================================================

delete from public.prints
where collection = 'kollektion-01'
  and slug in ('heidelberg', 'hirschhorn');

create or replace function public.enforce_collection_max_available_prints()
returns trigger
language plpgsql
as $$
declare
  available_prints integer;
  current_print_id uuid := case when tg_op = 'UPDATE' then old.id else null end;
  max_available_prints constant integer := 4;
begin
  if new.available is not true then
    return new;
  end if;

  select count(*)
  into available_prints
  from public.prints
  where collection = new.collection
    and available = true
    and (current_print_id is null or id <> current_print_id);

  if available_prints >= max_available_prints then
    raise exception 'Eine Kollektion darf maximal 4 verfuegbare Drucke enthalten.'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists prints_max_available_per_collection on public.prints;

create trigger prints_max_available_per_collection
before insert or update of collection, available
on public.prints
for each row
execute function public.enforce_collection_max_available_prints();
