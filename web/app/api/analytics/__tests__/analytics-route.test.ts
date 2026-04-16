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
  return new NextRequest("http://localhost/api/analytics", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("POST /api/analytics", () => {
  beforeEach(() => {
    vi.resetModules();
    getServiceClient.mockReset();
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

  it("captures Supabase insert failures", async () => {
    getServiceClient.mockReturnValue({
      from: () => ({
        insert: async () => ({ error: { message: "relation missing" } }),
      }),
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        event: "product_view",
        page: "/prints/dilsberg",
        motifSlug: "dilsberg",
        metadata: {},
        sessionId: "sess_123",
      })
    );

    expect(response.status).toBe(500);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });

  it("captures unexpected setup failures and preserves accepted response", async () => {
    getServiceClient.mockImplementation(() => {
      throw new Error("client init failed");
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        event: "product_view",
        page: "/prints/dilsberg",
        motifSlug: "dilsberg",
        metadata: {},
        sessionId: "sess_123",
      })
    );

    expect(response.status).toBe(202);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });
});
