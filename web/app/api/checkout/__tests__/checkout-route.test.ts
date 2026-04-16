import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getStripe = vi.fn();
const captureHandledException = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe,
}));

vi.mock("@/lib/sentry", () => ({
  captureHandledException,
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
    captureHandledException.mockReset();
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
