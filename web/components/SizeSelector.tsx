"use client";

import { useState } from "react";
import type { PrintVariantRow, PrintFormat } from "@/types/print";

interface SizeSelectorProps {
  variants: PrintVariantRow[];
  printTitle: string;
}

/** Format a price in cents as a Euro string with thin NBSP before the symbol. */
function formatPrice(cents: number): string {
  return `${Math.floor(cents / 100)}\u202f€`;
}

/** Format label text for a print format. */
function formatLabel(format: PrintFormat): string {
  return format === "framed" ? "Gerahmt" : "Print";
}

/**
 * Client Component — interactive size and format selector for the print detail page.
 * Manages selected variant state and displays the corresponding price.
 * The "In den Warenkorb" action is stubbed; BEI-34 (Cart) will wire the real handler
 * via a cart context or provider.
 */
export default function SizeSelector({ variants, printTitle }: SizeSelectorProps) {
  const inStockVariants = variants.filter((v) => v.in_stock);
  const [selectedId, setSelectedId] = useState<string>(
    inStockVariants[0]?.id ?? variants[0]?.id ?? ""
  );

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0];

  // Group variants by format for display.
  const formats: PrintFormat[] = ["print", "framed"];
  const variantsByFormat = formats.reduce<Record<PrintFormat, PrintVariantRow[]>>(
    (acc, f) => {
      acc[f] = variants.filter((v) => v.format === f);
      return acc;
    },
    { print: [], framed: [] }
  );

  /** Stub: will be replaced by cart context dispatch in BEI-34. */
  function handleAddToCart() {
    if (!selected) return;
    // TODO(BEI-34): dispatch to cart store — { printId, variantId, quantity: 1 }
    // eslint-disable-next-line no-console
    console.info("[Cart stub] addItem", {
      variantId: selected.id,
      sizeLabel: selected.size_label,
      format: selected.format,
      priceCents: selected.price_cents,
    });
  }

  if (variants.length === 0) {
    return (
      <p
        className="text-[var(--color-stone)]"
        style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-body)" }}
      >
        Aktuell nicht verfügbar.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Format + size groups ─────────────────────────────── */}
      {formats.map((format) => {
        const group = variantsByFormat[format];
        if (group.length === 0) return null;
        return (
          <div key={format} className="flex flex-col gap-2">
            <span
              className="uppercase text-[var(--color-stone)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-overline)",
                letterSpacing: "var(--tracking-overline)",
              }}
            >
              {formatLabel(format)}
            </span>
            <div className="flex flex-wrap gap-2" role="group" aria-label={`${formatLabel(format)}-Formate`}>
              {group.map((variant) => {
                const isSelected = variant.id === selectedId;
                const isAvailable = variant.in_stock;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => isAvailable && setSelectedId(variant.id)}
                    disabled={!isAvailable}
                    aria-pressed={isSelected}
                    aria-label={`${variant.size_label} ${formatLabel(format)}, ${formatPrice(variant.price_cents)}`}
                    className={[
                      "border px-4 py-2 transition-colors",
                      "text-left",
                      isSelected
                        ? "border-[var(--color-charcoal)] bg-[var(--color-charcoal)] text-[var(--color-paper)]"
                        : isAvailable
                          ? "border-[var(--color-loess)] bg-transparent text-[var(--color-charcoal)] hover:border-[var(--color-charcoal)]"
                          : "border-[var(--color-loess)] bg-transparent text-[var(--color-stone)] cursor-not-allowed opacity-50",
                    ].join(" ")}
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-caption)",
                    }}
                  >
                    {variant.size_label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ── Price display ──────────────────────────────────────── */}
      {selected && (
        <div className="flex items-baseline gap-3">
          <span
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "var(--text-h3)",
              lineHeight: "var(--leading-h3)",
            }}
            aria-live="polite"
            aria-label={`Preis: ${formatPrice(selected.price_cents)}`}
          >
            {formatPrice(selected.price_cents)}
          </span>
          <span
            className="text-[var(--color-stone)]"
            style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-caption)" }}
          >
            inkl. MwSt.
          </span>
        </div>
      )}

      {/* ── Add to Cart ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={!selected || !selected.in_stock}
        aria-label={`${printTitle}${selected ? `, ${selected.size_label} ${formatLabel(selected.format)}` : ""} in den Warenkorb legen`}
        className="w-full border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-8 py-4 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-sage)] hover:border-[var(--color-sage)] disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "var(--text-label)",
          letterSpacing: "var(--tracking-label)",
          fontWeight: 500,
        }}
      >
        In den Warenkorb
      </button>

      {/* ── Shipping note ──────────────────────────────────────── */}
      <p
        className="text-[var(--color-stone)]"
        style={{ fontFamily: "var(--font-sans)", fontSize: "var(--text-caption)" }}
      >
        Auf Bestellung gedruckt — Lieferzeit ca. 5–8 Werktage.
      </p>
    </div>
  );
}
