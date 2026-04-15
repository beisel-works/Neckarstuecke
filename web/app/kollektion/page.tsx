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

// Fallback data for dev without Supabase env vars.
const FALLBACK_PRINTS: PrintWithVariants[] = [
  {
    id: "fallback-1",
    slug: "minneburg",
    title: "Minneburg",
    location: "Neckartal bei Neckargerach",
    collection: "kollektion-01",
    description: "",
    emotional_narrative: "",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
  {
    id: "fallback-2",
    slug: "dilsberg",
    title: "Dilsberg",
    location: "Dilsberg, Neckar-Odenwald-Kreis",
    collection: "kollektion-01",
    description: "",
    emotional_narrative: "",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
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
    description: "",
    emotional_narrative: "",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [],
  },
  {
    id: "fallback-4",
    slug: "heidelberg",
    title: "Heidelberg",
    location: "Heidelberg, Philosophenweg",
    collection: "kollektion-01",
    description: "",
    emotional_narrative: "",
    material_description: "",
    image_web_preview_url: null,
    image_thumbnail_url: null,
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
        className="px-6 py-14 md:px-10 md:py-20"
        aria-label="Printkollektion"
      >
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
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
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 md:gap-x-8 md:gap-y-16">
              {prints.map((print) => (
                <PrintCard
                  key={print.slug}
                  print={print}
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
