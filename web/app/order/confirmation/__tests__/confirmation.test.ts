import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getStripe, captureHandledException } = vi.hoisted(() => ({
  getStripe: vi.fn(),
  captureHandledException: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe,
}));

vi.mock("@/lib/sentry", () => ({
  captureHandledException,
}));

import OrderConfirmationPage, { formatCents } from "../page";

describe("formatCents", () => {
  it("formats zero as 0,00 €", () => {
    expect(formatCents(0)).toBe("0,00\u00a0€");
  });

  it("formats 8900 as 89,00 €", () => {
    expect(formatCents(8900)).toBe("89,00\u00a0€");
  });

  it("formats 13999 as 139,99 €", () => {
    expect(formatCents(13999)).toBe("139,99\u00a0€");
  });

  it("formats 100 as 1,00 €", () => {
    expect(formatCents(100)).toBe("1,00\u00a0€");
  });

  it("formats large amounts correctly", () => {
    expect(formatCents(100000)).toBe("1.000,00\u00a0€");
  });
});

describe("OrderConfirmationPage error handling", () => {
  beforeEach(() => {
    getStripe.mockReset();
    captureHandledException.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("captures unexpected Stripe retrieval failures", async () => {
    getStripe.mockReturnValue({
      checkout: {
        sessions: {
          retrieve: vi.fn().mockRejectedValue(new Error("Stripe timeout")),
        },
      },
    });

    const result = await OrderConfirmationPage({
      searchParams: Promise.resolve({ session_id: "cs_test_123" }),
    });

    expect(result).toBeTruthy();
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });

  it("does not capture invalid session lookups", async () => {
    getStripe.mockReturnValue({
      checkout: {
        sessions: {
          retrieve: vi
            .fn()
            .mockRejectedValue(new Error("No such checkout.session: cs_missing")),
        },
      },
    });

    const result = await OrderConfirmationPage({
      searchParams: Promise.resolve({ session_id: "cs_missing" }),
    });

    expect(result).toBeTruthy();
    expect(captureHandledException).not.toHaveBeenCalled();
  });
});
