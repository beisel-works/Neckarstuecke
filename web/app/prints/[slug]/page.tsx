import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAvailablePrints, getPrintBySlug } from "@/lib/supabase/server";
import type { PrintWithVariants } from "@/types/print";
import PrintPurchasePanel from "@/components/PrintPurchasePanel";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import PrintGallery from "@/components/PrintGallery";

export const revalidate = 60; // ISR — revalidate each print page every 60 seconds

const hasSupabasePublicConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

// ── Fallback data for dev without Supabase env vars ─────────────────────────

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
    material_description:
      "Pigmentdruck auf Hahnemühle German Etching 310\u202fg/m² (Giclée). Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v1a", print_id: "fallback-1", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 9900, in_stock: true, available_on_request: false },
      { id: "v1b", print_id: "fallback-1", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 16900, in_stock: true, available_on_request: false },
      { id: "v1c", print_id: "fallback-1", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 27900, in_stock: true, available_on_request: false },
      { id: "v1d", print_id: "fallback-1", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 19900, in_stock: true, available_on_request: false },
      { id: "v1e", print_id: "fallback-1", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 34900, in_stock: true, available_on_request: false },
      { id: "v1f", print_id: "fallback-1", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "framed", price_cents: 53900, in_stock: false, available_on_request: true },
    ],
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
    material_description:
      "Pigmentdruck auf Hahnemühle German Etching 310\u202fg/m² (Giclée). Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v2a", print_id: "fallback-2", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 9900, in_stock: true, available_on_request: false },
      { id: "v2b", print_id: "fallback-2", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 16900, in_stock: true, available_on_request: false },
      { id: "v2c", print_id: "fallback-2", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 27900, in_stock: true, available_on_request: false },
      { id: "v2d", print_id: "fallback-2", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 19900, in_stock: true, available_on_request: false },
      { id: "v2e", print_id: "fallback-2", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 34900, in_stock: true, available_on_request: false },
      { id: "v2f", print_id: "fallback-2", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "framed", price_cents: 53900, in_stock: false, available_on_request: true },
    ],
  },
  {
    id: "fallback-3",
    slug: "guttenberg",
    title: "Guttenberg",
    location: "Burg Guttenberg, Neckarmühlbach",
    collection: "kollektion-01",
    description:
      "Burg Guttenberg über Neckarmühlbach - die erhaltene Höhenburg sitzt fest im Hang, gerahmt von dunklem Wald und spätem Licht.",
    emotional_narrative:
      "Guttenberg braucht keinen dramatischen Auftritt. Gerade weil sie erhalten geblieben ist, wirkt sie wie etwas, das nie um Aufmerksamkeit bitten musste.",
    material_description:
      "Pigmentdruck auf Hahnemühle German Etching 310\u202fg/m² (Giclée). Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v3a", print_id: "fallback-3", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 9900, in_stock: true, available_on_request: false },
      { id: "v3b", print_id: "fallback-3", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 16900, in_stock: true, available_on_request: false },
      { id: "v3c", print_id: "fallback-3", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 27900, in_stock: true, available_on_request: false },
      { id: "v3d", print_id: "fallback-3", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 19900, in_stock: true, available_on_request: false },
      { id: "v3e", print_id: "fallback-3", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 34900, in_stock: true, available_on_request: false },
      { id: "v3f", print_id: "fallback-3", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "framed", price_cents: 53900, in_stock: false, available_on_request: true },
    ],
  },
  {
    id: "fallback-4",
    slug: "bad-wimpfen",
    title: "Bad Wimpfen",
    location: "Bad Wimpfen am Neckar",
    collection: "kollektion-01",
    description:
      "Bad Wimpfen oberhalb des Neckars - die Silhouette von Stiftskirche, Kaiserpfalz und Altstadtdächern liegt ruhig im warmen Abendton.",
    emotional_narrative:
      "Bad Wimpfen ist kein einzelnes Monument. Der Ort lebt davon, dass Türme, Mauern und Gassen zusammen eine Haltung ergeben.",
    material_description:
      "Pigmentdruck auf Hahnemühle German Etching 310\u202fg/m² (Giclée). Lichtecht für 100 Jahre. Signiert und nummeriert.",
    image_web_preview_url: null,
    image_thumbnail_url: null,
    image_mockup_url: null,
    image_og_url: null,
    available: true,
    created_at: "2026-01-01T00:00:00Z",
    variants: [
      { id: "v4a", print_id: "fallback-4", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "print", price_cents: 9900, in_stock: true, available_on_request: false },
      { id: "v4b", print_id: "fallback-4", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "print", price_cents: 16900, in_stock: true, available_on_request: false },
      { id: "v4c", print_id: "fallback-4", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "print", price_cents: 27900, in_stock: true, available_on_request: false },
      { id: "v4d", print_id: "fallback-4", size_label: "30×40 cm", width_mm: 300, height_mm: 400, format: "framed", price_cents: 19900, in_stock: true, available_on_request: false },
      { id: "v4e", print_id: "fallback-4", size_label: "50×70 cm", width_mm: 500, height_mm: 700, format: "framed", price_cents: 34900, in_stock: true, available_on_request: false },
      { id: "v4f", print_id: "fallback-4", size_label: "70×100 cm", width_mm: 700, height_mm: 1000, format: "framed", price_cents: 53900, in_stock: false, available_on_request: true },
    ],
  },
];

async function getPrint(slug: string): Promise<PrintWithVariants | null> {
  try {
    return await getPrintBySlug(slug);
  } catch {
    if (hasSupabasePublicConfig) {
      throw new Error(`Failed to load print "${slug}" from Supabase.`);
    }

    return FALLBACK_PRINTS.find((p) => p.slug === slug) ?? null;
  }
}

async function getAllSlugs(): Promise<string[]> {
  try {
    const prints = await getAvailablePrints();
    return prints.map((p) => p.slug);
  } catch {
    if (hasSupabasePublicConfig) {
      throw new Error("Failed to load print slugs from Supabase.");
    }

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
  { label: "Ungerahmte Prints", detail: "Hahnemühle German Etching 310\u202fg/m²" },
  {
    label: "Gerahmte Editionen",
    detail: "HGE wenn freigegeben, sonst Fine-Art-Rahmenpapier",
  },
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
      <AnalyticsTracker
        event="product_view"
        page={`/prints/${print.slug}`}
        motifSlug={print.slug}
      />
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
            <PrintGallery
              title={print.title}
              artworkUrl={print.image_web_preview_url}
              mockupUrl={print.image_mockup_url}
            />

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
              <PrintPurchasePanel
                variants={print.variants}
                printTitle={print.title}
                printId={print.id}
                printSlug={print.slug}
                printImageUrl={print.image_thumbnail_url}
              />

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
                <p
                  className="mt-4 text-[var(--color-stone)]"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "var(--text-caption)",
                    lineHeight: "var(--leading-body)",
                  }}
                >
                  Gerahmte Editionen fertigen wir als klassische Rahmenarbeit.
                  Wenn das Labor fuer das gewaehlte Format Hahnemuehle German
                  Etching freigibt, verwenden wir dieses Papier. Andernfalls
                  erfuellen wir den Rahmen auf dem verfuegbaren Fine-Art-Papier
                  des Rahmenlabors.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
