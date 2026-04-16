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
  return new NextRequest("http://localhost/api/inquiries", {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
    },
  });
}

describe("POST /api/inquiries", () => {
  beforeEach(() => {
    vi.resetModules();
    getServiceClient.mockReset();
    captureHandledException.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 400 for missing required fields", async () => {
    const { POST } = await import("../route");
    const response = await POST(createRequest({ print_slug: "minneburg" }));

    expect(response.status).toBe(400);
    expect(captureHandledException).not.toHaveBeenCalled();
  });

  it("stores a valid inquiry", async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    getServiceClient.mockReturnValue({
      from: vi.fn(() => ({
        insert,
      })),
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        name: "Ada Käuferin",
        email: "ada@example.com",
        delivery_country: "DE",
        message: "Bitte mit Versand nach Heidelberg kalkulieren.",
        print_slug: "minneburg",
        variant_label: "70×100 cm Gerahmt",
        price_hint: "~529–549 €",
      })
    );

    expect(response.status).toBe(201);
    expect(insert).toHaveBeenCalledTimes(1);
  });

  it("captures insert failures", async () => {
    getServiceClient.mockReturnValue({
      from: vi.fn(() => ({
        insert: vi.fn().mockResolvedValue({ error: { message: "insert failed" } }),
      })),
    });

    const { POST } = await import("../route");
    const response = await POST(
      createRequest({
        name: "Ada Käuferin",
        email: "ada@example.com",
        delivery_country: "DE",
        print_slug: "minneburg",
        variant_label: "70×100 cm Gerahmt",
      })
    );

    expect(response.status).toBe(500);
    expect(captureHandledException).toHaveBeenCalledTimes(1);
  });
});
