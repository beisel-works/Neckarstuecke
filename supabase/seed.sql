-- ============================================================
-- Seed: Collection 01 - four initial Neckarstuecke motifs
-- Run after migration 001_prints_schema.sql
-- ============================================================

do $$
declare
  id_minneburg   uuid := 'a1000001-0000-0000-0000-000000000001';
  id_dilsberg    uuid := 'a1000001-0000-0000-0000-000000000002';
  id_guttenberg  uuid := 'a1000001-0000-0000-0000-000000000005';
  id_bad_wimpfen uuid := 'a1000001-0000-0000-0000-000000000006';
begin

  delete from prints
  where collection = 'kollektion-01'
    and slug not in ('minneburg', 'dilsberg', 'guttenberg', 'bad-wimpfen');

  update prints
  set
    title = 'Minneburg',
    location = 'Neckartal bei Neckargerach',
    collection = 'kollektion-01',
    description = 'Abendlicht ueber dem Talweg unterhalb der Minneburg - die offene Mauer und der Bergfried stehen warm gegen einen weiten Himmel.',
    emotional_narrative = 'Die Minneburg wirkt hier nicht wie ein Relikt, sondern wie ein Zeichen. Sie steht noch da, lange nachdem alles andere leiser geworden ist.',
    material_description = 'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
    available = true
  where slug = 'minneburg';

  if not found then
    insert into prints (
      id, slug, title, location, collection,
      description, emotional_narrative, material_description, available
    )
    values (
      id_minneburg,
      'minneburg',
      'Minneburg',
      'Neckartal bei Neckargerach',
      'kollektion-01',
      'Abendlicht ueber dem Talweg unterhalb der Minneburg - die offene Mauer und der Bergfried stehen warm gegen einen weiten Himmel.',
      'Die Minneburg wirkt hier nicht wie ein Relikt, sondern wie ein Zeichen. Sie steht noch da, lange nachdem alles andere leiser geworden ist.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    );
  end if;

  select id into id_minneburg
  from prints
  where slug = 'minneburg';

  update prints
  set
    title = 'Dilsberg',
    location = 'Dilsberg, Neckargemuend',
    collection = 'kollektion-01',
    description = 'Der befestigte Bergkegel von Dilsberg erhebt sich geschlossen ueber dem Neckar - Mauern, Daecher und Herbstkronen in einer ruhigen Abendordnung.',
    emotional_narrative = 'Dilsberg ist kein einzelnes Bauwerk, sondern ein ganzer Ort auf Abstand. Von unten wirkt er wie eine Insel, die sich selbst genug ist.',
    material_description = 'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
    available = true
  where slug = 'dilsberg';

  if not found then
    insert into prints (
      id, slug, title, location, collection,
      description, emotional_narrative, material_description, available
    )
    values (
      id_dilsberg,
      'dilsberg',
      'Dilsberg',
      'Dilsberg, Neckargemuend',
      'kollektion-01',
      'Der befestigte Bergkegel von Dilsberg erhebt sich geschlossen ueber dem Neckar - Mauern, Daecher und Herbstkronen in einer ruhigen Abendordnung.',
      'Dilsberg ist kein einzelnes Bauwerk, sondern ein ganzer Ort auf Abstand. Von unten wirkt er wie eine Insel, die sich selbst genug ist.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    );
  end if;

  select id into id_dilsberg
  from prints
  where slug = 'dilsberg';

  update prints
  set
    title = 'Guttenberg',
    location = 'Burg Guttenberg, Neckarmuehlbach',
    collection = 'kollektion-01',
    description = 'Burg Guttenberg ueber Neckarmuehlbach - die erhaltene Hoehenburg sitzt fest im Hang, gerahmt von dunklem Wald und spaetem Licht.',
    emotional_narrative = 'Guttenberg braucht keinen dramatischen Auftritt. Gerade weil sie erhalten geblieben ist, wirkt sie wie etwas, das nie um Aufmerksamkeit bitten musste.',
    material_description = 'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
    available = true
  where slug = 'guttenberg';

  if not found then
    insert into prints (
      id, slug, title, location, collection,
      description, emotional_narrative, material_description, available
    )
    values (
      id_guttenberg,
      'guttenberg',
      'Guttenberg',
      'Burg Guttenberg, Neckarmuehlbach',
      'kollektion-01',
      'Burg Guttenberg ueber Neckarmuehlbach - die erhaltene Hoehenburg sitzt fest im Hang, gerahmt von dunklem Wald und spaetem Licht.',
      'Guttenberg braucht keinen dramatischen Auftritt. Gerade weil sie erhalten geblieben ist, wirkt sie wie etwas, das nie um Aufmerksamkeit bitten musste.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    );
  end if;

  select id into id_guttenberg
  from prints
  where slug = 'guttenberg';

  update prints
  set
    title = 'Bad Wimpfen',
    location = 'Bad Wimpfen am Neckar',
    collection = 'kollektion-01',
    description = 'Bad Wimpfen oberhalb des Neckars - die Silhouette von Stiftskirche, Kaiserpfalz und Altstadtdaechern liegt ruhig im warmen Abendton.',
    emotional_narrative = 'Bad Wimpfen ist kein einzelnes Monument. Der Ort lebt davon, dass Tuerme, Mauern und Gassen zusammen eine Haltung ergeben.',
    material_description = 'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
    available = true
  where slug = 'bad-wimpfen';

  if not found then
    insert into prints (
      id, slug, title, location, collection,
      description, emotional_narrative, material_description, available
    )
    values (
      id_bad_wimpfen,
      'bad-wimpfen',
      'Bad Wimpfen',
      'Bad Wimpfen am Neckar',
      'kollektion-01',
      'Bad Wimpfen oberhalb des Neckars - die Silhouette von Stiftskirche, Kaiserpfalz und Altstadtdaechern liegt ruhig im warmen Abendton.',
      'Bad Wimpfen ist kein einzelnes Monument. Der Ort lebt davon, dass Tuerme, Mauern und Gassen zusammen eine Haltung ergeben.',
      'Pigmentdruck auf 310 g/m² Hahnemuehle Photo Rag. Lichtecht fuer 100 Jahre. Signiert und nummeriert.',
      true
    );
  end if;

  select id into id_bad_wimpfen
  from prints
  where slug = 'bad-wimpfen';

  insert into print_variants (
    print_id,
    size_label,
    width_mm,
    height_mm,
    format,
    price_cents,
    in_stock,
    available_on_request
  )
  values
    (id_minneburg, '30×40 cm', 300, 400, 'print', 9900, true, false),
    (id_minneburg, '50×70 cm', 500, 700, 'print', 16900, true, false),
    (id_minneburg, '70×100 cm', 700, 1000, 'print', 27900, true, false),
    (id_minneburg, '30×40 cm', 300, 400, 'framed', 19900, true, false),
    (id_minneburg, '50×70 cm', 500, 700, 'framed', 34900, true, false),
    (id_minneburg, '70×100 cm', 700, 1000, 'framed', 53900, false, true),
    (id_dilsberg, '30×40 cm', 300, 400, 'print', 9900, true, false),
    (id_dilsberg, '50×70 cm', 500, 700, 'print', 16900, true, false),
    (id_dilsberg, '70×100 cm', 700, 1000, 'print', 27900, true, false),
    (id_dilsberg, '30×40 cm', 300, 400, 'framed', 19900, true, false),
    (id_dilsberg, '50×70 cm', 500, 700, 'framed', 34900, true, false),
    (id_dilsberg, '70×100 cm', 700, 1000, 'framed', 53900, false, true),
    (id_guttenberg, '30×40 cm', 300, 400, 'print', 9900, true, false),
    (id_guttenberg, '50×70 cm', 500, 700, 'print', 16900, true, false),
    (id_guttenberg, '70×100 cm', 700, 1000, 'print', 27900, true, false),
    (id_guttenberg, '30×40 cm', 300, 400, 'framed', 19900, true, false),
    (id_guttenberg, '50×70 cm', 500, 700, 'framed', 34900, true, false),
    (id_guttenberg, '70×100 cm', 700, 1000, 'framed', 53900, false, true),
    (id_bad_wimpfen, '30×40 cm', 300, 400, 'print', 9900, true, false),
    (id_bad_wimpfen, '50×70 cm', 500, 700, 'print', 16900, true, false),
    (id_bad_wimpfen, '70×100 cm', 700, 1000, 'print', 27900, true, false),
    (id_bad_wimpfen, '30×40 cm', 300, 400, 'framed', 19900, true, false),
    (id_bad_wimpfen, '50×70 cm', 500, 700, 'framed', 34900, true, false),
    (id_bad_wimpfen, '70×100 cm', 700, 1000, 'framed', 53900, false, true)
  on conflict (print_id, width_mm, height_mm, format) do update
  set
    size_label = excluded.size_label,
    price_cents = excluded.price_cents,
    in_stock = excluded.in_stock,
    available_on_request = excluded.available_on_request;

end $$;
