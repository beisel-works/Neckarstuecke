-- ============================================================
-- Migration 005: dedupe seeded print variants and enforce uniqueness
-- ============================================================

delete from public.print_variants duplicate
using public.print_variants canonical
where duplicate.print_id = canonical.print_id
  and duplicate.width_mm = canonical.width_mm
  and duplicate.height_mm = canonical.height_mm
  and duplicate.format = canonical.format
  and duplicate.id > canonical.id;

create unique index if not exists print_variants_unique_variant_idx
  on public.print_variants (print_id, width_mm, height_mm, format);
