import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const getServiceClient = vi.fn();
const captureHandledException = vi.fn();

vi.mock("@/lib/supabase/service", () => ({
  getServiceClient,
}));

vi.mock("@/lib/sentry", () => ({
  captureHandledException,
}));

function createRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost/api/webhooks/prodigi", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("POST /api/webhooks/prodigi", () => {
  beforeEach(() => {
    vi.resetModules();
    getServiceClient.mockReset();
    captureHandledException.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not capture invalid JSON", async () => {
    const { POST } = await import("../route");
    const response = await POST(
      new NextRequest("http://localhost/api/webhooks/prodigi", {
        method: "POST",
        body: "{bad json",
        headers: {
          "content-type": "application/json",
        },
      })
    );

    expect(response.status).toBe(400);
    expect(captureHandledException).not.toHaveBeenCalled();
  });

  it("captures database lookup failures", async () => {
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
          error: { message: "db down" },
        }),
      }),
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        type: "com.prodigi.order.status.stage.changed#InProgress",
        subject: "ord_123",
        data: {
          id: "ord_123",
          status: { stage: "InProgress" },
        },
      })
    );

    expect(response.status).toBe(500);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });
});
