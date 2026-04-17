import type { Metadata } from "next";
import { getAvailablePrints } from "@/lib/supabase/server";
import type { PrintWithVariants } from "@/types/print";
import PrintCard from "@/components/PrintCard";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const revalidate = 60; // ISR — revalidate catalog every 60 seconds

export const metadata: Metadata = {
  title: "Alle Prints – Neckarstücke",
  description:
    "Die vollständige Kollektion Neckarstücke — Feinkunstdrucke aus dem Neckartal. Limitierte Editionen auf Hahnemühle Fine Art Papier, signiert und nummeriert.",
  openGraph: {
    title: "Alle Prints – Neckarstücke",
    description:
      "Die vollständige Kollektion Neckarstücke — Feinkunstdrucke aus dem Neckartal.",
    type: "website",
    locale: "de_DE",
  },
};

const hasSupabasePublicConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

// Fallback data for dev without Supabase env vars.
const FALLBACK_PRINTS: PrintWithVariants[] = [
  {
    id: "fallback-1",
    slug: "minneburg",
    title: "Minneburg",
    location: "Neckartal bei Neckargerach",
    collection: "kollektion-01",
    description:
      "Abendlicht über dem Talweg unterhalb der Minneburg - die offene Mauer und der Bergfried stehen warm gegen einen weiten Himmel.",
    emotional_narrative:
      "Die Minneburg wirkt hier nicht wie ein Relikt, sondern wie ein Zeichen. Sie steht noch da, lange nachdem alles andere leiser geworden ist.",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
  {
    id: "fallback-2",
    slug: "dilsberg",
    title: "Dilsberg",
    location: "Dilsberg, Neckargemünd",
    collection: "kollektion-01",
    description:
      "Der befestigte Bergkegel von Dilsberg erhebt sich geschlossen über dem Neckar - Mauern, Dächer und Herbstkronen in einer ruhigen Abendordnung.",
    emotional_narrative:
      "Dilsberg ist kein einzelnes Bauwerk, sondern ein ganzer Ort auf Abstand. Von unten wirkt er wie eine Insel, die sich selbst genug ist.",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
  {
    id: "fallback-3",
    slug: "hirschhorn",
    title: "Hirschhorn",
    location: "Hirschhorn am Neckar",
    collection: "kollektion-01",
    description:
      "Goldene Stunde in Hirschhorn - Burg auf dem Sandsteinsporn, Altstadt darunter, der Neckar als stilles Band im Licht.",
    emotional_narrative:
      "Das Licht macht Hirschhorn nicht weich. Es zeigt nur für einen Moment, wie selbstverständlich diese Burg über dem Fluss steht.",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
  {
    id: "fallback-4",
    slug: "heidelberg",
    title: "Heidelberg",
    location: "Heidelberg, Alte Brücke und Schloss",
    collection: "kollektion-01",
    description:
      "Heidelberg im warmen Abendlicht - Alte Brücke, Schloss und Dachlandschaft greifen über den Neckar ineinander, ohne ins Postkartenhafte zu kippen.",
    emotional_narrative:
      "Nicht das touristische Heidelberg, sondern das, das bleibt, wenn der Tag leiser wird: Stein, Fluss, Hang und eine Stadt mit Gedächtnis.",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
  {
    id: "fallback-5",
    slug: "guttenberg",
    title: "Guttenberg",
    location: "Burg Guttenberg, Neckarmühlbach",
    collection: "kollektion-01",
    description:
      "Burg Guttenberg über Neckarmühlbach - die erhaltene Höhenburg sitzt fest im Hang, gerahmt von dunklem Wald und spätem Licht.",
    emotional_narrative:
      "Guttenberg braucht keinen dramatischen Auftritt. Gerade weil sie erhalten geblieben ist, wirkt sie wie etwas, das nie um Aufmerksamkeit bitten musste.",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
  {
    id: "fallback-6",
    slug: "bad-wimpfen",
    title: "Bad Wimpfen",
    location: "Bad Wimpfen am Neckar",
    collection: "kollektion-01",
    description:
      "Bad Wimpfen oberhalb des Neckars - die Silhouette von Stiftskirche, Kaiserpfalz und Altstadtdächern liegt ruhig im warmen Abendton.",
    emotional_narrative:
      "Bad Wimpfen ist kein einzelnes Monument. Der Ort lebt davon, dass Türme, Mauern und Gassen zusammen eine Haltung ergeben.",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
];

async function getPrints(): Promise<PrintWithVariants[]> {
  try {
    return await getAvailablePrints();
  } catch {
    if (hasSupabasePublicConfig) {
      throw new Error("Failed to load prints from Supabase.");
    }

    return FALLBACK_PRINTS;
  }
}

export default async function KollektionPage() {
  const prints = await getPrints();

  return (
    <div className="flex flex-col">
      <AnalyticsTracker page="/kollektion" />
      {/* ── Page header ───────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-10 md:px-10 md:pt-24 md:pb-14">
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
          <p
            className="mb-4 uppercase text-[var(--color-sage)]"
            style={{
              fontSize: "var(--text-overline)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Kollektion 01
          </p>
          <h1
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, var(--text-h1))",
              lineHeight: "var(--leading-h1)",
              letterSpacing: "var(--tracking-h1)",
            }}
          >
            Alle Prints
          </h1>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div
        className="mx-6 h-px bg-[var(--color-loess)] md:mx-10"
        aria-hidden="true"
      />

      {/* ── Catalog grid ──────────────────────────────────────────── */}
      <section
        className="px-6 py-16 md:px-10 md:py-24"
        aria-label="Printkollektion"
      >
        <div
          className="mx-auto"
          style={{ maxWidth: "calc(var(--container-content) - var(--spacing-8))" }}
        >
          {prints.length === 0 ? (
            <p
              className="text-center text-[var(--color-stone)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Neue Motive erscheinen bald.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:gap-x-8 md:gap-y-16">
              {prints.map((print) => (
                <PrintCard
                  key={print.slug}
                  print={print}
                  sizes="50vw"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
