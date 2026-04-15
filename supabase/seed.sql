-- ============================================================
-- Seed: Collection 01 — four initial Neckarstücke motifs
-- Run after migration 001_prints_schema.sql
-- ============================================================

-- Use deterministic UUIDs so re-seeding is idempotent.
do $$
declare
  id_minneburg  uuid := 'a1000001-0000-0000-0000-000000000001';
  id_dilsberg   uuid := 'a1000001-0000-0000-0000-000000000002';
  id_hirschhorn uuid := 'a1000001-0000-0000-0000-000000000003';
  id_heidelberg uuid := 'a1000001-0000-0000-0000-000000000004';
begin

  -- ── NS-01 Minneburg ────────────────────────────────────────
  insert into prints (id, slug, title, location, collection,
    description, emotional_narrative, material_description,
    available)
  values (
    id_minneburg,
    'minneburg',
    'Minneburg',
    'Neckartal bei Neckargerach',
    'kollektion-01',
    'Herbstsilhouette der Minneburg über dem Neckar — Bergfried und kahle Bäume gegen einen kühlen Himmel.',
    'Manche Orte brauchen keinen Namen. Die Minneburg ist einer davon — für alle, die das Neckartal wirklich kennen.',
    'Pigmentdruck auf 310 g/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.',
    true
  ) on conflict (id) do nothing;

  insert into print_variants (print_id, size_label, width_mm, height_mm, format, price_cents, in_stock)
  values
    (id_minneburg, '30×40 cm',  300,  400, 'print',  8900, true),
    (id_minneburg, '50×70 cm',  500,  700, 'print', 13900, true),
    (id_minneburg, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_minneburg, '30×40 cm',  300,  400, 'framed', 18900, true),
    (id_minneburg, '50×70 cm',  500,  700, 'framed', 28900, true)
  on conflict do nothing;

  -- ── NS-02 Dilsberg ─────────────────────────────────────────
  insert into prints (id, slug, title, location, collection,
    description, emotional_narrative, material_description,
    available)
  values (
    id_dilsberg,
    'dilsberg',
    'Dilsberg',
    'Dilsberg, Neckar-Odenwald-Kreis',
    'kollektion-01',
    'Frühsommer am Dilsberg — der befestigte Bergsporn über dem Neckartal, drei Bildebenen, Morgenlicht.',
    'Die Ruine thront über dem Tal wie eh und je. Wer unten steht, weiß warum Menschen hierher gezogen sind.',
    'Pigmentdruck auf 310 g/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.',
    true
  ) on conflict (id) do nothing;

  insert into print_variants (print_id, size_label, width_mm, height_mm, format, price_cents, in_stock)
  values
    (id_dilsberg, '30×40 cm',  300,  400, 'print',  8900, true),
    (id_dilsberg, '50×70 cm',  500,  700, 'print', 13900, true),
    (id_dilsberg, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_dilsberg, '30×40 cm',  300,  400, 'framed', 18900, true),
    (id_dilsberg, '50×70 cm',  500,  700, 'framed', 28900, true)
  on conflict do nothing;

  -- ── NS-03 Hirschhorn ───────────────────────────────────────
  insert into prints (id, slug, title, location, collection,
    description, emotional_narrative, material_description,
    available)
  values (
    id_hirschhorn,
    'hirschhorn',
    'Hirschhorn',
    'Hirschhorn am Neckar',
    'kollektion-01',
    'Goldene Stunde in Hirschhorn — Burg auf dem Ochre-Felsen, Spiegelung im Neckar, warmes Licht.',
    'Das Licht trifft den Sandstein genau eine Stunde am Tag so. Dieses Bild ist diese Stunde.',
    'Pigmentdruck auf 310 g/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.',
    true
  ) on conflict (id) do nothing;

  insert into print_variants (print_id, size_label, width_mm, height_mm, format, price_cents, in_stock)
  values
    (id_hirschhorn, '30×40 cm',  300,  400, 'print',  8900, true),
    (id_hirschhorn, '50×70 cm',  500,  700, 'print', 13900, true),
    (id_hirschhorn, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_hirschhorn, '30×40 cm',  300,  400, 'framed', 18900, true),
    (id_hirschhorn, '50×70 cm',  500,  700, 'framed', 28900, true)
  on conflict do nothing;

  -- ── NS-04 Heidelberg ───────────────────────────────────────
  insert into prints (id, slug, title, location, collection,
    description, emotional_narrative, material_description,
    available)
  values (
    id_heidelberg,
    'heidelberg',
    'Heidelberg',
    'Philosophenweg, Heidelberg',
    'kollektion-01',
    'Blaue Stunde über dem Schloss — Sicht vom Philosophenweg, geometrische Kubatur gegen Valley-Sage-Himmel.',
    'Nicht der touristische Blick. Der Blick der Menschen, die jeden Abend hochgehen und wissen, was sie haben.',
    'Pigmentdruck auf 310 g/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.',
    true
  ) on conflict (id) do nothing;

  insert into print_variants (print_id, size_label, width_mm, height_mm, format, price_cents, in_stock)
  values
    (id_heidelberg, '30×40 cm',  300,  400, 'print',  8900, true),
    (id_heidelberg, '50×70 cm',  500,  700, 'print', 13900, true),
    (id_heidelberg, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_heidelberg, '30×40 cm',  300,  400, 'framed', 18900, true),
    (id_heidelberg, '50×70 cm',  500,  700, 'framed', 28900, true)
  on conflict do nothing;

end $$;
