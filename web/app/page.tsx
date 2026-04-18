import type { Metadata } from "next";
import Link from "next/link";
import { getAvailablePrints } from "@/lib/supabase/server";
import type { PrintWithVariants } from "@/types/print";
import PrintCard from "@/components/PrintCard";
import AnalyticsTracker from "@/components/AnalyticsTracker";

export const metadata: Metadata = {
  title: "Neckarstücke — Kunstdrucke aus dem Neckartal",
  description:
    "Feinkunstdrucke für Menschen, die das Neckartal kennen. Limitierte Editionen, gedruckt auf Hahnemühle German Etching 310 g/m² (Giclée). Signiert und nummeriert.",
  openGraph: {
    title: "Neckarstücke — Kunstdrucke aus dem Neckartal",
    description:
      "Feinkunstdrucke für Menschen, die das Neckartal kennen. Limitierte Editionen, gedruckt auf Hahnemühle German Etching 310 g/m² (Giclée).",
    type: "website",
    locale: "de_DE",
  },
};

const hasSupabasePublicConfig = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
);

function isFeaturedPrint(
  print: Pick<PrintWithVariants, "slug" | "title" | "location" | "image_thumbnail_url"> | undefined
): print is Pick<PrintWithVariants, "slug" | "title" | "location" | "image_thumbnail_url"> {
  return Boolean(print);
}

// Fallback prints shown when Supabase is not configured (dev without env vars).
const FALLBACK_PRINTS: Pick<
  PrintWithVariants,
  "slug" | "title" | "location" | "image_thumbnail_url"
>[] = [
  { slug: "minneburg", title: "Minneburg", location: "Neckartal bei Neckargerach", image_thumbnail_url: null },
  { slug: "dilsberg", title: "Dilsberg", location: "Dilsberg, Neckargemünd", image_thumbnail_url: null },
  { slug: "guttenberg", title: "Guttenberg", location: "Burg Guttenberg, Neckarmühlbach", image_thumbnail_url: null },
  { slug: "bad-wimpfen", title: "Bad Wimpfen", location: "Bad Wimpfen am Neckar", image_thumbnail_url: null },
];

async function getFeaturedPrints(): Promise<
  Pick<PrintWithVariants, "slug" | "title" | "location" | "image_thumbnail_url">[]
> {
  try {
    const prints = await getAvailablePrints();
    return prints
      .slice(0, 4)
      .map((print) => ({
        slug: print.slug,
        title: print.title,
        location: print.location,
        image_thumbnail_url: print.image_thumbnail_url,
      }))
      .filter(isFeaturedPrint);
  } catch {
    if (hasSupabasePublicConfig) {
      throw new Error("Failed to load featured prints from Supabase.");
    }

    return FALLBACK_PRINTS;
  }
}

export default async function HomePage() {
  const featuredPrints = await getFeaturedPrints();

  return (
    <div className="flex flex-col">
      <AnalyticsTracker page="/" />
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center md:py-36 md:px-10">
        <p
          className="mb-6 uppercase text-[var(--color-sage)]"
          style={{
            fontSize: "var(--text-overline)",
            fontFamily: "var(--font-sans)",
            letterSpacing: "var(--tracking-overline)",
          }}
        >
          Erste Kollektion — 2026
        </p>

        <h1
          className="mb-6 max-w-3xl text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.25rem, 5vw, var(--text-display))",
            lineHeight: "var(--leading-display)",
            letterSpacing: "var(--tracking-display)",
          }}
        >
          Das Neckartal.
          <br />
          Unvergänglich.
        </h1>

        <p
          className="mb-10 max-w-xl text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-body)",
          }}
        >
          Feinkunstdrucke für Menschen, die das Neckartal kennen — jene, die
          geblieben sind, und jene, die gegangen sind und es noch immer in sich
          tragen.
        </p>

        <Link
          href="/kollektion"
          className="inline-flex items-center justify-center rounded-none border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-8 py-3 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-sage)] hover:border-[var(--color-sage)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          Kollektion entdecken
        </Link>
      </section>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div
        className="mx-auto h-px w-16 bg-[var(--color-loess)]"
        aria-hidden="true"
      />

      {/* ── Featured prints grid ──────────────────────────────────── */}
      <section
        className="px-6 py-16 md:px-10 md:py-24"
        aria-labelledby="kollektion-heading"
      >
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
          <p
            id="kollektion-heading"
            className="mb-10 text-center uppercase text-[var(--color-sage)]"
            style={{
              fontSize: "var(--text-overline)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Kollektion 01
          </p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {featuredPrints.map((print) => (
              <PrintCard
                key={print.slug}
                print={print}
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/kollektion"
              className="inline-flex items-center gap-2 text-[var(--color-charcoal)] hover:text-[var(--color-sage)] transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-label)",
                letterSpacing: "var(--tracking-label)",
              }}
            >
              Alle Drucke ansehen
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Divider ───────────────────────────────────────────────── */}
      <div
        className="mx-auto h-px w-16 bg-[var(--color-loess)]"
        aria-hidden="true"
      />

      {/* ── Brand promise ─────────────────────────────────────────── */}
      <section
        className="px-6 py-16 md:px-10 md:py-24 bg-[var(--color-loess)]"
        aria-labelledby="versprechen-heading"
      >
        <div
          className="mx-auto"
          style={{ maxWidth: "var(--container-prose)" }}
        >
          <p
            id="versprechen-heading"
            className="mb-8 uppercase text-[var(--color-sage)]"
            style={{
              fontSize: "var(--text-overline)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Was Neckarstücke ist
          </p>

          <h2
            className="mb-8 text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, var(--text-h2))",
              lineHeight: "var(--leading-h2)",
              letterSpacing: "var(--tracking-h2)",
            }}
          >
            Keine Massenware. Kein generisches Wandbild.
          </h2>

          <div
            className="space-y-5 text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-body)",
              lineHeight: "var(--leading-body)",
            }}
          >
            <p>
              Jeder Druck in der Kollektion entsteht auf Bestellung — auf{" "}
              <strong>Hahnemühle German Etching 310 g/m² (Giclée)</strong>,
              einem der angesehensten Fine-Art-Papiere der Welt.
              Pigmentbasierter Druck, lichtecht für über 100 Jahre.
            </p>
            <p>
              Die Motive sind keine Fotografien. Sie sind Illustrationen -
              verdichtete Erinnerungen an Orte, die einen kennen, wenn man das
              Neckartal kennt: die Minneburg im Herbst, der Dilsberg im
              Morgenlicht, Guttenberg im späten Licht, Bad Wimpfen ueber dem
              Fluss.
            </p>
            <p>
              Jede Edition ist nummeriert und signiert. Die Auflage bleibt
              begrenzt.
            </p>
          </div>

          <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:gap-10">
            {[
              { label: "Hahnemühle German Etching", detail: "310 g/m² (Giclée)" },
              { label: "Lichtecht", detail: "Über 100 Jahre" },
              { label: "Auf Bestellung", detail: "Signiert & nummeriert" },
            ].map(({ label, detail }) => (
              <div key={label} className="flex flex-col gap-1">
                <span
                  className="text-[var(--color-charcoal)] font-medium"
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
      </section>
    </div>
  );
}
