import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailablePrints, getPrintBySlug } from "@/lib/supabase/server";
import type { PrintWithVariants } from "@/types/print";
import SizeSelector from "@/components/SizeSelector";

export const revalidate = 60; // ISR — revalidate each print page every 60 seconds

// ── Fallback data for dev without Supabase env vars ─────────────────────────

const FALLBACK_PRINTS: PrintWithVariants[] = [
  {
    id: "fallback-1",
    slug: "minneburg",
    title: "Minneburg",
    location: "Neckartal bei Neckargerach",
    collection: "kollektion-01",
    description:
      "Herbstsilhouette der Minneburg über dem Neckar — Bergfried und kahle Bäume gegen einen kühlen Himmel.",
    emotional_narrative:
      "Manche Orte brauchen keinen Namen. Die Minneburg ist einer davon — für alle, die das Neckartal wirklich kennen.",
    material_description:
      "Pigmentdruck auf 310\u202fg/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v1a", print_id: "fallback-1", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 8900, in_stock: true },
      { id: "v1b", print_id: "fallback-1", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 13900, in_stock: true },
      { id: "v1c", print_id: "fallback-1", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 21900, in_stock: true },
      { id: "v1d", print_id: "fallback-1", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 18900, in_stock: true },
      { id: "v1e", print_id: "fallback-1", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 28900, in_stock: true },
    ],
  },
  {
    id: "fallback-2",
    slug: "dilsberg",
    title: "Dilsberg",
    location: "Dilsberg, Neckar-Odenwald-Kreis",
    collection: "kollektion-01",
    description:
      "Frühsommer am Dilsberg — der befestigte Bergsporn über dem Neckartal, drei Bildebenen, Morgenlicht.",
    emotional_narrative:
      "Die Ruine thront über dem Tal wie eh und je. Wer unten steht, weiß warum Menschen hierher gezogen sind.",
    material_description:
      "Pigmentdruck auf 310\u202fg/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v2a", print_id: "fallback-2", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 8900, in_stock: true },
      { id: "v2b", print_id: "fallback-2", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 13900, in_stock: true },
      { id: "v2c", print_id: "fallback-2", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 21900, in_stock: true },
      { id: "v2d", print_id: "fallback-2", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 18900, in_stock: true },
      { id: "v2e", print_id: "fallback-2", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 28900, in_stock: true },
    ],
  },
  {
    id: "fallback-3",
    slug: "hirschhorn",
    title: "Hirschhorn",
    location: "Hirschhorn am Neckar",
    collection: "kollektion-01",
    description:
      "Goldene Stunde in Hirschhorn — Burg auf dem Ochre-Felsen, Spiegelung im Neckar, warmes Licht.",
    emotional_narrative:
      "Das Licht trifft den Sandstein genau eine Stunde am Tag so. Dieses Bild ist diese Stunde.",
    material_description:
      "Pigmentdruck auf 310\u202fg/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v3a", print_id: "fallback-3", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 8900, in_stock: true },
      { id: "v3b", print_id: "fallback-3", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 13900, in_stock: true },
      { id: "v3c", print_id: "fallback-3", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 21900, in_stock: true },
      { id: "v3d", print_id: "fallback-3", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 18900, in_stock: true },
      { id: "v3e", print_id: "fallback-3", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 28900, in_stock: true },
    ],
  },
  {
    id: "fallback-4",
    slug: "heidelberg",
    title: "Heidelberg",
    location: "Heidelberg, Philosophenweg",
    collection: "kollektion-01",
    description:
      "Blaue Stunde am Philosophenweg — das Schloss als geometrische Kubatur über der Stadt, Valley-Sage-Himmel.",
    emotional_narrative:
      "Heidelberg aus der Sicht derer, die es wirklich kennen — nicht die Postkarte, sondern der Abend.",
    material_description:
      "Pigmentdruck auf 310\u202fg/m² Hahnemühle Photo Rag. Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v4a", print_id: "fallback-4", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 8900, in_stock: true },
      { id: "v4b", print_id: "fallback-4", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 13900, in_stock: true },
      { id: "v4c", print_id: "fallback-4", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 21900, in_stock: true },
      { id: "v4d", print_id: "fallback-4", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 18900, in_stock: true },
      { id: "v4e", print_id: "fallback-4", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 28900, in_stock: true },
    ],
  },
];

async function getPrint(slug: string): Promise<PrintWithVariants | null> {
  try {
    return await getPrintBySlug(slug);
  } catch {
    // Supabase unavailable (dev without env vars) — check fallback.
    return FALLBACK_PRINTS.find((p) => p.slug === slug) ?? null;
  }
}

async function getAllSlugs(): Promise<string[]> {
  try {
    const prints = await getAvailablePrints();
    return prints.map((p) => p.slug);
  } catch {
    return FALLBACK_PRINTS.map((p) => p.slug);
  }
}

// ── Static generation ────────────────────────────────────────────────────────

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const print = await getPrint(slug);

  if (!print) {
    return {
      title: "Print nicht gefunden – Neckarstücke",
    };
  }

  return {
    title: `${print.title} – Neckarstücke`,
    description: print.description,
    openGraph: {
      title: `${print.title} – Neckarstücke`,
      description: print.emotional_narrative || print.description,
      type: "website",
      locale: "de_DE",
      images: print.image_og_url
        ? [{ url: print.image_og_url, width: 1200, height: 630, alt: print.title }]
        : [],
    },
  };
}

// ── Quality callouts ─────────────────────────────────────────────────────────

const QUALITY_CALLOUTS = [
  { label: "Hahnemühle Fine Art", detail: "310\u202fg/m² Photo Rag" },
  { label: "Archivtinte", detail: "Lichtecht 100+ Jahre" },
  { label: "Auf Bestellung", detail: "Signiert & nummeriert" },
] as const;

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function PrintDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const print = await getPrint(slug);

  if (!print) notFound();

  return (
    <div className="flex flex-col">
      {/* ── Breadcrumb ──────────────────────────────────────────── */}
      <nav
        className="px-6 pt-8 pb-4 md:px-10"
        aria-label="Breadcrumb"
      >
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
          <Link
            href="/kollektion"
            className="inline-flex items-center gap-1 text-[var(--color-stone)] hover:text-[var(--color-charcoal)] transition-colors"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-caption)",
            }}
          >
            <span aria-hidden="true">←</span>
            <span>Kollektion</span>
          </Link>
        </div>
      </nav>

      {/* ── Main content ─────────────────────────────────────────── */}
      <main>
        <div
          className="mx-auto px-6 pb-20 md:px-10 md:pb-32"
          style={{ maxWidth: "var(--container-content)" }}
        >
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-20">

            {/* ── Artwork image ──────────────────────────────────── */}
            <div className="relative aspect-[2/3] w-full overflow-hidden bg-[var(--color-loess)]">
              {print.image_web_preview_url ? (
                <Image
                  src={print.image_web_preview_url}
                  alt={print.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
              ) : (
                /* Placeholder when no artwork image is available */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8">
                  <span
                    className="text-center text-[var(--color-stone)]"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "var(--text-h2)",
                      lineHeight: "var(--leading-h2)",
                    }}
                  >
                    {print.title}
                  </span>
                  <span
                    className="text-[var(--color-stone)]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-caption)",
                    }}
                  >
                    {print.location}
                  </span>
                </div>
              )}
            </div>

            {/* ── Product details ────────────────────────────────── */}
            <div className="flex flex-col justify-center gap-8">

              {/* Collection label */}
              <p
                className="uppercase text-[var(--color-sage)]"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-overline)",
                  letterSpacing: "var(--tracking-overline)",
                }}
              >
                Kollektion 01
              </p>

              {/* Title + location */}
              <div className="flex flex-col gap-2">
                <h1
                  className="text-[var(--color-charcoal)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(2rem, 4vw, var(--text-h1))",
                    lineHeight: "var(--leading-h1)",
                    letterSpacing: "var(--tracking-h1)",
                  }}
                >
                  {print.title}
                </h1>
                <p
                  className="text-[var(--color-stone)]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-body)",
                  }}
                >
                  {print.location}
                </p>
              </div>

              {/* Divider */}
              <div className="h-px bg-[var(--color-loess)]" aria-hidden="true" />

              {/* Emotional narrative */}
              {print.emotional_narrative && (
                <p
                  className="text-[var(--color-charcoal)]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--text-h4)",
                    lineHeight: "var(--leading-body)",
                    fontStyle: "italic",
                  }}
                >
                  {print.emotional_narrative}
                </p>
              )}

              {/* Description */}
              {print.description && (
                <p
                  className="text-[var(--color-charcoal)]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-body)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  {print.description}
                </p>
              )}

              {/* Divider */}
              <div className="h-px bg-[var(--color-loess)]" aria-hidden="true" />

              {/* Size selector + add to cart */}
              <SizeSelector variants={print.variants} printTitle={print.title} />

              {/* Quality callouts */}
              <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:gap-8">
                {QUALITY_CALLOUTS.map(({ label, detail }) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span
                      className="font-medium text-[var(--color-charcoal)]"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-label)",
                        letterSpacing: "var(--tracking-label)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      className="text-[var(--color-stone)]"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-caption)",
                      }}
                    >
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Material description ─────────────────────────────── */}
          {print.material_description && (
            <div
              className="mt-16 border-t border-[var(--color-loess)] pt-10 md:mt-24 md:pt-14"
            >
              <div style={{ maxWidth: "var(--container-text)" }}>
                <p
                  className="mb-3 uppercase text-[var(--color-sage)]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-overline)",
                    letterSpacing: "var(--tracking-overline)",
                  }}
                >
                  Material & Druck
                </p>
                <p
                  className="text-[var(--color-charcoal)]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-body)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  {print.material_description}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
