import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getStripe = vi.fn();
const getServiceClient = vi.fn();
const captureHandledException = vi.fn();
const triggerTask = vi.fn();

vi.mock("@/lib/stripe", () => ({
  getStripe,
}));

vi.mock("@/lib/supabase/service", () => ({
  getServiceClient,
}));

vi.mock("@/lib/sentry", () => ({
  captureHandledException,
}));

vi.mock("@trigger.dev/sdk/v3", () => ({
  tasks: {
    trigger: triggerTask,
  },
}));

function createRequest(): NextRequest {
  return new NextRequest("http://localhost/api/webhooks/stripe", {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
      "stripe-signature": "t=1,v1=abc",
      "content-type": "application/json",
    },
  });
}

describe("POST /api/webhooks/stripe", () => {
  const previousSecret = process.env.STRIPE_WEBHOOK_SECRET;

  beforeEach(() => {
    vi.resetModules();
    getStripe.mockReset();
    getServiceClient.mockReset();
    captureHandledException.mockReset();
    triggerTask.mockReset();
  });

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = previousSecret;
    vi.restoreAllMocks();
  });

  it("captures missing webhook secret failures", async () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;

    const { POST } = await import("../route");
    const response = await POST(createRequest());

    expect(response.status).toBe(500);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });

  it("captures persistence failures", async () => {
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    getStripe.mockReturnValue({
      webhooks: {
        constructEvent: vi.fn().mockReturnValue({
          type: "checkout.session.completed",
          data: { object: { id: "cs_test_123" } },
        }),
      },
      checkout: {
        sessions: {
          retrieve: vi.fn().mockResolvedValue({
            id: "cs_test_123",
            line_items: { data: [] },
          }),
        },
      },
    });
    getServiceClient.mockReturnValue({
      from: () => ({
        select() {
          return this;
        },
        eq() {
          return this;
        },
        maybeSingle: async () => ({
          data: null,
          error: { message: "orders lookup failed" },
        }),
      }),
    });

    const { POST } = await import("../route");
    const response = await POST(createRequest());

    expect(response.status).toBe(500);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
    expect(triggerTask).not.toHaveBeenCalled();
  });
});
