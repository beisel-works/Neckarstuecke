-- ============================================================
-- Seed: Collection 01 - six initial Neckarstuecke motifs
-- Run after migration 001_prints_schema.sql
-- ============================================================

do $$
declare
  id_minneburg   uuid := 'a1000001-0000-0000-0000-000000000001';
  id_dilsberg    uuid := 'a1000001-0000-0000-0000-000000000002';
  id_hirschhorn  uuid := 'a1000001-0000-0000-0000-000000000003';
  id_heidelberg  uuid := 'a1000001-0000-0000-0000-000000000004';
  id_guttenberg  uuid := 'a1000001-0000-0000-0000-000000000005';
  id_bad_wimpfen uuid := 'a1000001-0000-0000-0000-000000000006';
begin

  insert into prints (
    id, slug, title, location, collection,
    description, emotional_narrative, material_description, available
  )
  values
    (
      id_minneburg,
      'minneburg',
      'Minneburg',
      'Neckartal bei Neckargerach',
      'kollektion-01',
      'Abendlicht ueber dem Talweg unterhalb der Minneburg - die offene Mauer und der Bergfried stehen warm gegen einen weiten Himmel.',
      'Die Minneburg wirkt hier nicht wie ein Relikt, sondern wie ein Zeichen. Sie steht noch da, lange nachdem alles andere leiser geworden ist.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    ),
    (
      id_dilsberg,
      'dilsberg',
      'Dilsberg',
      'Dilsberg, Neckargemuend',
      'kollektion-01',
      'Der befestigte Bergkegel von Dilsberg erhebt sich geschlossen ueber dem Neckar - Mauern, Daecher und Herbstkronen in einer ruhigen Abendordnung.',
      'Dilsberg ist kein einzelnes Bauwerk, sondern ein ganzer Ort auf Abstand. Von unten wirkt er wie eine Insel, die sich selbst genug ist.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    ),
    (
      id_hirschhorn,
      'hirschhorn',
      'Hirschhorn',
      'Hirschhorn am Neckar',
      'kollektion-01',
      'Goldene Stunde in Hirschhorn - Burg auf dem Felsen, Spiegelung im Neckar, warmes Licht.',
      'Das Licht trifft den Sandstein genau eine Stunde am Tag so. Dieses Bild ist diese Stunde.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    ),
    (
      id_heidelberg,
      'heidelberg',
      'Heidelberg',
      'Heidelberg, Alte Bruecke und Schloss',
      'kollektion-01',
      'Heidelberg im warmen Abendlicht - Alte Bruecke, Schloss und Dachlandschaft greifen ueber den Neckar ineinander, ohne ins Postkartenhafte zu kippen.',
      'Nicht das touristische Heidelberg, sondern das, das bleibt, wenn der Tag leiser wird: Stein, Fluss, Hang und eine Stadt mit Gedaechtnis.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    ),
    (
      id_guttenberg,
      'guttenberg',
      'Guttenberg',
      'Burg Guttenberg, Neckarmuehlbach',
      'kollektion-01',
      'Burg Guttenberg ueber Neckarmuehlbach - die erhaltene Hoehenburg sitzt fest im Hang, gerahmt von dunklem Wald und spaetem Licht.',
      'Guttenberg braucht keinen dramatischen Auftritt. Gerade weil sie erhalten geblieben ist, wirkt sie wie etwas, das nie um Aufmerksamkeit bitten musste.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    ),
    (
      id_bad_wimpfen,
      'bad-wimpfen',
      'Bad Wimpfen',
      'Bad Wimpfen am Neckar',
      'kollektion-01',
      'Bad Wimpfen oberhalb des Neckars - die Silhouette von Stiftskirche, Kaiserpfalz und Altstadtdaechern liegt ruhig im warmen Abendton.',
      'Bad Wimpfen ist kein einzelnes Monument. Der Ort lebt davon, dass Tuerme, Mauern und Gassen zusammen eine Haltung ergeben.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    )
  on conflict (id) do update
  set
    slug = excluded.slug,
    title = excluded.title,
    location = excluded.location,
    collection = excluded.collection,
    description = excluded.description,
    emotional_narrative = excluded.emotional_narrative,
    material_description = excluded.material_description,
    available = excluded.available;

  insert into print_variants (print_id, size_label, width_mm, height_mm, format, price_cents, in_stock)
  values
    (id_minneburg, '30×40 cm', 300, 400, 'print', 8900, true),
    (id_minneburg, '50×70 cm', 500, 700, 'print', 13900, true),
    (id_minneburg, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_minneburg, '30×40 cm', 300, 400, 'framed', 18900, true),
    (id_minneburg, '50×70 cm', 500, 700, 'framed', 28900, true),
    (id_dilsberg, '30×40 cm', 300, 400, 'print', 8900, true),
    (id_dilsberg, '50×70 cm', 500, 700, 'print', 13900, true),
    (id_dilsberg, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_dilsberg, '30×40 cm', 300, 400, 'framed', 18900, true),
    (id_dilsberg, '50×70 cm', 500, 700, 'framed', 28900, true),
    (id_hirschhorn, '30×40 cm', 300, 400, 'print', 8900, true),
    (id_hirschhorn, '50×70 cm', 500, 700, 'print', 13900, true),
    (id_hirschhorn, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_hirschhorn, '30×40 cm', 300, 400, 'framed', 18900, true),
    (id_hirschhorn, '50×70 cm', 500, 700, 'framed', 28900, true),
    (id_heidelberg, '30×40 cm', 300, 400, 'print', 8900, true),
    (id_heidelberg, '50×70 cm', 500, 700, 'print', 13900, true),
    (id_heidelberg, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_heidelberg, '30×40 cm', 300, 400, 'framed', 18900, true),
    (id_heidelberg, '50×70 cm', 500, 700, 'framed', 28900, true),
    (id_guttenberg, '30×40 cm', 300, 400, 'print', 8900, true),
    (id_guttenberg, '50×70 cm', 500, 700, 'print', 13900, true),
    (id_guttenberg, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_guttenberg, '30×40 cm', 300, 400, 'framed', 18900, true),
    (id_guttenberg, '50×70 cm', 500, 700, 'framed', 28900, true),
    (id_bad_wimpfen, '30×40 cm', 300, 400, 'print', 8900, true),
    (id_bad_wimpfen, '50×70 cm', 500, 700, 'print', 13900, true),
    (id_bad_wimpfen, '70×100 cm', 700, 1000, 'print', 21900, true),
    (id_bad_wimpfen, '30×40 cm', 300, 400, 'framed', 18900, true),
    (id_bad_wimpfen, '50×70 cm', 500, 700, 'framed', 28900, true)
  on conflict do nothing;

end $$;
