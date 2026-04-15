import { describe, it, expect } from "vitest";
import type { CheckoutPayload, CheckoutLineItem } from "@/types/cart";

// ---------------------------------------------------------------------------
// Pure validation logic extracted from the route for unit testing.
// The actual route requires a live Stripe key; these tests cover the
// input-validation guards that run before any Stripe call is made.
// ---------------------------------------------------------------------------

function validatePayload(
  body: unknown
): { ok: true; payload: CheckoutPayload } | { ok: false; status: number; error: string } {
  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as Record<string, unknown>).lineItems)
  ) {
    return {
      ok: false,
      status: 400,
      error: "Invalid payload: lineItems array required.",
    };
  }

  const { lineItems } = body as CheckoutPayload;

  if (lineItems.length === 0) {
    return {
      ok: false,
      status: 400,
      error: "Cart is empty — at least one line item required.",
    };
  }

  for (const item of lineItems) {
    if (
      !item.variantId ||
      typeof item.variantId !== "string" ||
      typeof item.quantity !== "number" ||
      item.quantity < 1 ||
      !Number.isInteger(item.quantity) ||
      typeof item.priceInCents !== "number" ||
      item.priceInCents < 1 ||
      !Number.isInteger(item.priceInCents)
    ) {
      return {
        ok: false,
        status: 400,
        error:
          "Invalid line item: each item must have a variantId string, a positive integer quantity, and a positive integer priceInCents.",
      };
    }
  }

  return { ok: true, payload: body as CheckoutPayload };
}

// ── Fixtures ─────────────────────────────────────────────────────────────────

const validItem: CheckoutLineItem = {
  variantId: "variant-abc",
  quantity: 1,
  priceInCents: 8900,
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("checkout payload validation", () => {
  it("accepts a well-formed single item payload", () => {
    const result = validatePayload({ lineItems: [validItem] });
    expect(result.ok).toBe(true);
  });

  it("accepts multiple valid line items", () => {
    const result = validatePayload({
      lineItems: [validItem, { variantId: "variant-xyz", quantity: 2, priceInCents: 13900 }],
    });
    expect(result.ok).toBe(true);
  });

  it("rejects null body", () => {
    const result = validatePayload(null);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.status).toBe(400);
  });

  it("rejects body without lineItems", () => {
    const result = validatePayload({ items: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toContain("lineItems array required");
  });

  it("rejects empty lineItems array", () => {
    const result = validatePayload({ lineItems: [] });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.status).toBe(400);
      expect(result.error).toContain("empty");
    }
  });

  it("rejects item with missing variantId", () => {
    const result = validatePayload({
      lineItems: [{ variantId: "", quantity: 1, priceInCents: 8900 }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects item with zero quantity", () => {
    const result = validatePayload({
      lineItems: [{ variantId: "v1", quantity: 0, priceInCents: 8900 }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects item with fractional quantity", () => {
    const result = validatePayload({
      lineItems: [{ variantId: "v1", quantity: 1.5, priceInCents: 8900 }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects item with zero priceInCents", () => {
    const result = validatePayload({
      lineItems: [{ variantId: "v1", quantity: 1, priceInCents: 0 }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects item with negative priceInCents", () => {
    const result = validatePayload({
      lineItems: [{ variantId: "v1", quantity: 1, priceInCents: -100 }],
    });
    expect(result.ok).toBe(false);
  });

  it("rejects item with fractional priceInCents", () => {
    const result = validatePayload({
      lineItems: [{ variantId: "v1", quantity: 1, priceInCents: 89.5 }],
    });
    expect(result.ok).toBe(false);
  });
});
