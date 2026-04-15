import { describe, it, expect } from "vitest";

// ---------------------------------------------------------------------------
// Pure logic extracted from the webhook handler for unit testing.
// The route itself requires live Stripe / Supabase credentials; these tests
// cover the validation and data-mapping logic that runs before any I/O.
// ---------------------------------------------------------------------------

// ── Local types for test fixtures (subset of Stripe.Checkout.Session) ─────

interface ShippingAddress {
  city?: string;
  country?: string;
  line1?: string;
  postal_code?: string;
}

interface FakeSession {
  id?: string;
  customer_email?: string | null;
  amount_total?: number | null;
  currency?: string | null;
  payment_intent?: string | { id: string } | null;
  customer_details?: { email?: string | null } | null;
  collected_information?: {
    shipping_details?: { address?: ShippingAddress | null } | null;
  } | null;
  line_items?: {
    data: Array<{
      description?: string | null;
      quantity?: number | null;
      amount_total?: number | null;
      currency?: string | null;
    }>;
  };
}

// ── Helpers mirroring route logic ─────────────────────────────────────────

function extractOrderRecord(session: FakeSession) {
  const lineItems = (session.line_items?.data ?? []).map((item) => ({
    description: item.description ?? "",
    quantity: item.quantity ?? 1,
    amount_total: item.amount_total ?? 0,
    currency: item.currency ?? "eur",
  }));

  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? null;

  return {
    stripe_session_id: session.id ?? "",
    stripe_payment_intent_id:
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : (session.payment_intent?.id ?? null),
    status: "paid" as const,
    customer_email: customerEmail,
    shipping_address:
      session.collected_information?.shipping_details?.address ?? null,
    line_items: lineItems,
    total_cents: session.amount_total ?? null,
    currency: session.currency ?? "eur",
  };
}

function validateSignaturePresent(header: string | null): boolean {
  return header !== null && header.length > 0;
}

// ── Fixtures ─────────────────────────────────────────────────────────────

const minimalSession: FakeSession = {
  id: "cs_test_abc123",
  customer_email: "test@example.com",
  amount_total: 8900,
  currency: "eur",
  payment_intent: "pi_test_xyz",
  customer_details: { email: "test@example.com" },
  collected_information: {
    shipping_details: {
      address: {
        city: "Heidelberg",
        country: "DE",
        line1: "Hauptstraße 1",
        postal_code: "69117",
      },
    },
  },
  line_items: {
    data: [
      {
        description: "Minneburg 30×40 cm – Print",
        quantity: 1,
        amount_total: 8900,
        currency: "eur",
      },
    ],
  },
};

// ── Tests: signature validation ────────────────────────────────────────────

describe("webhook signature validation", () => {
  it("accepts a non-empty signature header", () => {
    expect(validateSignaturePresent("t=123,v1=abc")).toBe(true);
  });

  it("rejects null header", () => {
    expect(validateSignaturePresent(null)).toBe(false);
  });

  it("rejects empty string header", () => {
    expect(validateSignaturePresent("")).toBe(false);
  });
});

// ── Tests: order record extraction ────────────────────────────────────────

describe("order record extraction from checkout session", () => {
  it("maps stripe_session_id correctly", () => {
    const record = extractOrderRecord(minimalSession);
    expect(record.stripe_session_id).toBe("cs_test_abc123");
  });

  it("maps payment_intent string correctly", () => {
    const record = extractOrderRecord(minimalSession);
    expect(record.stripe_payment_intent_id).toBe("pi_test_xyz");
  });

  it("maps payment_intent object id correctly", () => {
    const session: FakeSession = { ...minimalSession, payment_intent: { id: "pi_obj_123" } };
    const record = extractOrderRecord(session);
    expect(record.stripe_payment_intent_id).toBe("pi_obj_123");
  });

  it("sets payment_intent to null when absent", () => {
    const session: FakeSession = { ...minimalSession, payment_intent: null };
    const record = extractOrderRecord(session);
    expect(record.stripe_payment_intent_id).toBeNull();
  });

  it("prefers customer_details.email over customer_email", () => {
    const session: FakeSession = {
      ...minimalSession,
      customer_email: "fallback@example.com",
      customer_details: { email: "primary@example.com" },
    };
    const record = extractOrderRecord(session);
    expect(record.customer_email).toBe("primary@example.com");
  });

  it("falls back to customer_email when customer_details.email is absent", () => {
    const session: FakeSession = {
      ...minimalSession,
      customer_details: null,
      customer_email: "fallback@example.com",
    };
    const record = extractOrderRecord(session);
    expect(record.customer_email).toBe("fallback@example.com");
  });

  it("sets customer_email to null when both are absent", () => {
    const session: FakeSession = {
      ...minimalSession,
      customer_details: null,
      customer_email: null,
    };
    const record = extractOrderRecord(session);
    expect(record.customer_email).toBeNull();
  });

  it("maps total_cents from amount_total", () => {
    const record = extractOrderRecord(minimalSession);
    expect(record.total_cents).toBe(8900);
  });

  it("sets total_cents to null when amount_total is absent", () => {
    const session: FakeSession = { ...minimalSession, amount_total: null };
    const record = extractOrderRecord(session);
    expect(record.total_cents).toBeNull();
  });

  it("maps currency correctly", () => {
    const record = extractOrderRecord(minimalSession);
    expect(record.currency).toBe("eur");
  });

  it("defaults currency to 'eur' when absent", () => {
    const session: FakeSession = { ...minimalSession, currency: null };
    const record = extractOrderRecord(session);
    expect(record.currency).toBe("eur");
  });

  it("maps line_items array correctly", () => {
    const record = extractOrderRecord(minimalSession);
    expect(record.line_items).toHaveLength(1);
    expect(record.line_items[0]).toMatchObject({
      description: "Minneburg 30×40 cm – Print",
      quantity: 1,
      amount_total: 8900,
      currency: "eur",
    });
  });

  it("returns empty line_items when data is absent", () => {
    const session: FakeSession = { ...minimalSession, line_items: undefined };
    const record = extractOrderRecord(session);
    expect(record.line_items).toHaveLength(0);
  });

  it("maps shipping_address from collected_information.shipping_details", () => {
    const record = extractOrderRecord(minimalSession);
    expect(record.shipping_address).toMatchObject({
      city: "Heidelberg",
      country: "DE",
    });
  });

  it("sets shipping_address to null when collected_information is absent", () => {
    const session: FakeSession = { ...minimalSession, collected_information: null };
    const record = extractOrderRecord(session);
    expect(record.shipping_address).toBeNull();
  });

  it("always sets status to 'paid'", () => {
    const record = extractOrderRecord(minimalSession);
    expect(record.status).toBe("paid");
  });
});
