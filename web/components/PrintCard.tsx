import Link from "next/link";
import Image from "next/image";
import type { PrintVariantRow } from "@/types/print";

export interface PrintCardData {
  slug: string;
  title: string;
  location: string;
  image_thumbnail_url: string | null;
  variants?: PrintVariantRow[];
}

interface PrintCardProps {
  print: PrintCardData;
  /** Next.js Image sizes attribute — caller knows the layout context. */
  sizes?: string;
  /** URL prefix for the detail link. Defaults to "/kollektion". */
  linkPrefix?: string;
}

/** Returns the lowest price_cents across in-stock variants, or null if none. */
export function getStartingPriceCents(variants: PrintVariantRow[] | undefined): number | null {
  if (!variants || variants.length === 0) return null;
  const inStock = variants.filter((v) => v.in_stock);
  if (inStock.length === 0) return null;
  return inStock.reduce((min, v) => Math.min(min, v.price_cents), Infinity);
}

/** Formats a cent value as a compact Euro string, e.g. "ab 49 €". */
export function formatStartingPrice(cents: number | null): string | null {
  if (cents === null || cents === Infinity) return null;
  const euros = Math.floor(cents / 100);
  return `ab ${euros}\u202f€`;
}

export default function PrintCard({
  print,
  sizes = "(max-width: 768px) 50vw, 33vw",
  linkPrefix = "/kollektion",
}: PrintCardProps) {
  const startingCents = getStartingPriceCents(print.variants);
  const priceLabel = formatStartingPrice(startingCents);

  return (
    <Link
      href={`${linkPrefix}/${print.slug}`}
      className="group flex flex-col"
      aria-label={`${print.title} — ${print.location}`}
    >
      {/* Print thumbnail */}
      <div className="relative aspect-[2/3] overflow-hidden bg-[var(--color-loess)]">
        {print.image_thumbnail_url ? (
          <Image
            src={print.image_thumbnail_url}
            alt={print.title}
            fill
            sizes={sizes}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-4">
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

      {/* Print label */}
      <div className="mt-3 flex flex-col gap-0.5">
        <span
          className="text-[var(--color-charcoal)] transition-colors group-hover:text-[var(--color-sage)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h4)",
            lineHeight: "var(--leading-h4)",
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
        {priceLabel && (
          <span
            className="mt-1 text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-caption)",
              fontWeight: 500,
            }}
          >
            {priceLabel}
          </span>
        )}
      </div>
    </Link>
  );
}
