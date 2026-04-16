import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getStripe = vi.fn();
const getStripePriceId = vi.fn();
const captureHandledException = vi.fn();
const getServiceClient = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe,
  getStripePriceId,
}));

vi.mock("@/lib/sentry", () => ({
  captureHandledException,
}));

vi.mock("@/lib/supabase/service", () => ({
  getServiceClient,
}));

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      origin: "https://www.neckarstuecke.de",
    },
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    vi.resetModules();
    getStripe.mockReset();
    getStripePriceId.mockReset();
    captureHandledException.mockReset();
    getServiceClient.mockReset();

    getServiceClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          in: vi.fn().mockResolvedValue({
            data: [
              {
                id: "v1",
                size_label: "30×40 cm",
                format: "print",
                price_cents: 9900,
                in_stock: true,
                available_on_request: false,
                prints: { slug: "minneburg" },
              },
            ],
            error: null,
          }),
        })),
      })),
    });
    getStripePriceId.mockReturnValue("price_123");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not capture invalid payload errors", async () => {
    const { POST } = await import("../route");
    const response = await POST(createRequest({}));

    expect(response.status).toBe(400);
    expect(captureHandledException).not.toHaveBeenCalled();
  });

  it("captures Stripe failures", async () => {
    getStripe.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn().mockRejectedValue(new Error("Stripe down")),
        },
      },
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        lineItems: [{ variantId: "v1", quantity: 1, priceInCents: 8900 }],
      })
    );

    expect(response.status).toBe(500);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });

  it("uses Stripe Price IDs from server-side variant data", async () => {
    const create = vi
      .fn()
      .mockResolvedValue({ url: "https://checkout.stripe.test/session" });
    getStripe.mockReturnValue({
      checkout: {
        sessions: {
          create,
        },
      },
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        lineItems: [{ variantId: "v1", quantity: 2, priceInCents: 1 }],
      })
    );

    expect(response.status).toBe(200);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [{ price: "price_123", quantity: 2 }],
        metadata: expect.objectContaining({
          cart_items: JSON.stringify([{ variantId: "v1", quantity: 2 }]),
        }),
      })
    );
  });

  it("rejects variants that are not available for checkout", async () => {
    getServiceClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          in: vi.fn().mockResolvedValue({
            data: [
              {
                id: "v1",
                size_label: "70×100 cm",
                format: "framed",
                price_cents: 53900,
                in_stock: false,
                available_on_request: true,
                prints: { slug: "minneburg" },
              },
            ],
            error: null,
          }),
        })),
      })),
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        lineItems: [{ variantId: "v1", quantity: 1, priceInCents: 53900 }],
      })
    );

    expect(response.status).toBe(400);
  });

  it("captures missing checkout URLs", async () => {
    getStripe.mockReturnValue({
      checkout: {
        sessions: {
          create: vi.fn().mockResolvedValue({ url: null }),
        },
      },
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        lineItems: [{ variantId: "v1", quantity: 1, priceInCents: 8900 }],
      })
    );

    expect(response.status).toBe(500);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });
});
