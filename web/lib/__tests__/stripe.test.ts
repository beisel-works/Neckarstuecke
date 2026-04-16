import { describe, expect, it, vi } from "vitest";
import { getStripePriceId, normaliseSkuKey } from "@/lib/stripe";

describe("stripe env key lookup", () => {
  it("normalises SKU keys for Stripe lookup keys", () => {
    expect(normaliseSkuKey("bad-wimpfen", "30×40 cm", "print")).toBe(
      "BAD-WIMPFEN__30X40-CM__PRINT"
    );
  });

  it("prefers Vercel-safe env names with underscores", () => {
    vi.stubEnv(
      "STRIPE_PRICE_BAD_WIMPFEN__30X40_CM__PRINT",
      "price_vercel_safe"
    );
    vi.stubEnv(
      "STRIPE_PRICE_BAD-WIMPFEN__30X40-CM__PRINT",
      "price_legacy"
    );

    expect(getStripePriceId("bad-wimpfen", "30×40 cm", "print")).toBe(
      "price_vercel_safe"
    );
  });

  it("falls back to the legacy hyphenated env name", () => {
    vi.stubEnv(
      "STRIPE_PRICE_MINNEBURG__30X40-CM__PRINT",
      "price_legacy_only"
    );

    expect(getStripePriceId("minneburg", "30×40 cm", "print")).toBe(
      "price_legacy_only"
    );
  });
});
