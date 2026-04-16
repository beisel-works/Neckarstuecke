import { describe, it, expect } from "vitest";
import type { PrintVariantRow } from "@/types/print";
import { getStartingPriceCents, formatStartingPrice } from "@/components/PrintCard";

// ── getStartingPriceCents ────────────────────────────────────────────────────

const makeVariant = (overrides: Partial<PrintVariantRow> = {}): PrintVariantRow => ({
  id: "v1",
  print_id: "p1",
  size_label: "30×40 cm",
  width_mm: 300,
  height_mm: 400,
  format: "print",
  price_cents: 4900,
  in_stock: true,
  available_on_request: false,
  ...overrides,
});

describe("getStartingPriceCents", () => {
  it("returns null for undefined variants", () => {
    expect(getStartingPriceCents(undefined)).toBeNull();
  });

  it("returns null for empty variants array", () => {
    expect(getStartingPriceCents([])).toBeNull();
  });

  it("returns null when no variants are in stock", () => {
    const variants = [
      makeVariant({ price_cents: 4900, in_stock: false }),
      makeVariant({ id: "v2", price_cents: 3900, in_stock: false }),
    ];
    expect(getStartingPriceCents(variants)).toBeNull();
  });

  it("returns the minimum in-stock price_cents", () => {
    const variants = [
      makeVariant({ id: "v1", price_cents: 9900, in_stock: true }),
      makeVariant({ id: "v2", price_cents: 4900, in_stock: true }),
      makeVariant({ id: "v3", price_cents: 14900, in_stock: true }),
    ];
    expect(getStartingPriceCents(variants)).toBe(4900);
  });

  it("ignores out-of-stock variants when computing minimum", () => {
    const variants = [
      makeVariant({ id: "v1", price_cents: 1000, in_stock: false }), // cheapest but out of stock
      makeVariant({ id: "v2", price_cents: 4900, in_stock: true }),
    ];
    expect(getStartingPriceCents(variants)).toBe(4900);
  });

  it("works with a single in-stock variant", () => {
    expect(getStartingPriceCents([makeVariant({ price_cents: 4900 })])).toBe(4900);
  });
});

// ── formatStartingPrice ──────────────────────────────────────────────────────

describe("formatStartingPrice", () => {
  it("returns null for null input", () => {
    expect(formatStartingPrice(null)).toBeNull();
  });

  it("returns null for Infinity (all out of stock edge case)", () => {
    expect(formatStartingPrice(Infinity)).toBeNull();
  });

  it("formats whole-euro amounts correctly", () => {
    expect(formatStartingPrice(4900)).toBe("ab 49\u202f€");
  });

  it("floors fractional euro values", () => {
    // 4950 cents = 49.50€ → displayed as 49 (floor, not round)
    expect(formatStartingPrice(4950)).toBe("ab 49\u202f€");
  });

  it("formats three-digit euro amounts correctly", () => {
    expect(formatStartingPrice(14900)).toBe("ab 149\u202f€");
  });
});

// ── Integration: price derivation from full variant sets ─────────────────────

describe("catalog price derivation (integration)", () => {
  it("picks cheapest in-stock print variant across formats", () => {
    const variants: PrintVariantRow[] = [
      makeVariant({ id: "v1", size_label: "30×40 cm", price_cents: 4900, format: "print", in_stock: true }),
      makeVariant({ id: "v2", size_label: "50×70 cm", price_cents: 8900, format: "print", in_stock: true }),
      makeVariant({ id: "v3", size_label: "30×40 cm", price_cents: 12900, format: "framed", in_stock: true }),
    ];
    const cents = getStartingPriceCents(variants);
    expect(formatStartingPrice(cents)).toBe("ab 49\u202f€");
  });

  it("shows correct price when cheapest size is out of stock", () => {
    const variants: PrintVariantRow[] = [
      makeVariant({ id: "v1", size_label: "30×40 cm", price_cents: 3900, in_stock: false }),
      makeVariant({ id: "v2", size_label: "50×70 cm", price_cents: 6900, in_stock: true }),
    ];
    const cents = getStartingPriceCents(variants);
    expect(formatStartingPrice(cents)).toBe("ab 69\u202f€");
  });
});
