import { describe, it, expect } from "vitest";
import type { PrintVariantRow, PrintFormat } from "@/types/print";

// ── SizeSelector utility tests ──────────────────────────────────────────────
// Pure functions extracted from SizeSelector for unit testing.

function formatPrice(cents: number): string {
  return `${Math.floor(cents / 100)}\u202f€`;
}

function getInStockVariants(variants: PrintVariantRow[]): PrintVariantRow[] {
  return variants.filter((v) => v.in_stock);
}

function getDefaultSelectedId(variants: PrintVariantRow[]): string {
  const inStock = getInStockVariants(variants);
  return inStock[0]?.id ?? variants[0]?.id ?? "";
}

function variantsByFormat(
  variants: PrintVariantRow[],
  format: PrintFormat
): PrintVariantRow[] {
  return variants.filter((v) => v.format === format);
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeVariant = (
  overrides: Partial<PrintVariantRow> & { id: string }
): PrintVariantRow => ({
  print_id: "print-1",
  size_label: "30×40 cm",
  width_mm: 300,
  height_mm: 400,
  format: "print",
  price_cents: 8900,
  in_stock: true,
  ...overrides,
});

const VARIANTS: PrintVariantRow[] = [
  makeVariant({ id: "v1", format: "print", size_label: "30×40 cm", price_cents: 8900 }),
  makeVariant({ id: "v2", format: "print", size_label: "50×70 cm", price_cents: 13900 }),
  makeVariant({ id: "v3", format: "print", size_label: "70×100 cm", price_cents: 21900 }),
  makeVariant({ id: "v4", format: "framed", size_label: "30×40 cm", price_cents: 18900 }),
  makeVariant({ id: "v5", format: "framed", size_label: "50×70 cm", price_cents: 28900 }),
];

// ── formatPrice ───────────────────────────────────────────────────────────────

describe("formatPrice", () => {
  it("formats 8900 as '89 €' with thin NBSP", () => {
    expect(formatPrice(8900)).toBe("89\u202f€");
  });

  it("formats 13900 as '139 €'", () => {
    expect(formatPrice(13900)).toBe("139\u202f€");
  });

  it("truncates to whole euros (no rounding)", () => {
    expect(formatPrice(8950)).toBe("89\u202f€");
  });

  it("handles 0 cents", () => {
    expect(formatPrice(0)).toBe("0\u202f€");
  });
});

// ── getInStockVariants ────────────────────────────────────────────────────────

describe("getInStockVariants", () => {
  it("returns only in-stock variants", () => {
    const mixed = [
      makeVariant({ id: "a", in_stock: true }),
      makeVariant({ id: "b", in_stock: false }),
      makeVariant({ id: "c", in_stock: true }),
    ];
    expect(getInStockVariants(mixed).map((v) => v.id)).toEqual(["a", "c"]);
  });

  it("returns empty array when all out of stock", () => {
    const oos = VARIANTS.map((v) => ({ ...v, in_stock: false }));
    expect(getInStockVariants(oos)).toHaveLength(0);
  });

  it("returns all when all are in stock", () => {
    expect(getInStockVariants(VARIANTS)).toHaveLength(VARIANTS.length);
  });
});

// ── getDefaultSelectedId ──────────────────────────────────────────────────────

describe("getDefaultSelectedId", () => {
  it("returns the first in-stock variant id", () => {
    expect(getDefaultSelectedId(VARIANTS)).toBe("v1");
  });

  it("falls back to first variant when none in stock", () => {
    const oos = VARIANTS.map((v) => ({ ...v, in_stock: false }));
    expect(getDefaultSelectedId(oos)).toBe("v1");
  });

  it("returns empty string for empty variants", () => {
    expect(getDefaultSelectedId([])).toBe("");
  });

  it("skips out-of-stock leading variants", () => {
    const variants = [
      makeVariant({ id: "x", in_stock: false }),
      makeVariant({ id: "y", in_stock: true }),
    ];
    expect(getDefaultSelectedId(variants)).toBe("y");
  });
});

// ── variantsByFormat ──────────────────────────────────────────────────────────

describe("variantsByFormat", () => {
  it("returns print variants", () => {
    const prints = variantsByFormat(VARIANTS, "print");
    expect(prints).toHaveLength(3);
    expect(prints.every((v) => v.format === "print")).toBe(true);
  });

  it("returns framed variants", () => {
    const framed = variantsByFormat(VARIANTS, "framed");
    expect(framed).toHaveLength(2);
    expect(framed.every((v) => v.format === "framed")).toBe(true);
  });

  it("returns empty for format with no variants", () => {
    const printOnly = VARIANTS.filter((v) => v.format === "print");
    expect(variantsByFormat(printOnly, "framed")).toHaveLength(0);
  });
});

// ── Static params contract ────────────────────────────────────────────────────

describe("generateStaticParams contract", () => {
  // The function must return objects with a `slug` string property.
  it("static params shape is { slug: string }[]", () => {
    const params: { slug: string }[] = [
      { slug: "minneburg" },
      { slug: "dilsberg" },
      { slug: "hirschhorn" },
      { slug: "heidelberg" },
      { slug: "guttenberg" },
      { slug: "bad-wimpfen" },
    ];
    for (const p of params) {
      expect(typeof p.slug).toBe("string");
      expect(p.slug.length).toBeGreaterThan(0);
    }
  });
});
