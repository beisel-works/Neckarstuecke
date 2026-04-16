import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const captureException = vi.fn(() => "event_123");
const flush = vi.fn();
const withScope = vi.fn((callback: (scope: {
  setTag: (key: string, value: string) => void;
}) => string) =>
  callback({
    setTag: vi.fn(),
  })
);

vi.mock("@sentry/nextjs", () => ({
  captureException,
  flush,
  withScope,
}));

describe("POST /api/health/sentry", () => {
  const previousToken = process.env.SENTRY_SMOKE_TOKEN;

  beforeEach(() => {
    vi.resetModules();
    captureException.mockClear();
    flush.mockClear();
    withScope.mockClear();
  });

  afterEach(() => {
    process.env.SENTRY_SMOKE_TOKEN = previousToken;
    vi.restoreAllMocks();
  });

  it("returns 404 without a valid token", async () => {
    process.env.SENTRY_SMOKE_TOKEN = "smoke-secret";
    const { POST } = await import("../route");
    const response = await POST(
      new NextRequest("http://localhost/api/health/sentry", { method: "POST" })
    );

    expect(response.status).toBe(404);
    expect(captureException).not.toHaveBeenCalled();
  });

  it("captures and flushes a smoke-test event with a valid token", async () => {
    process.env.SENTRY_SMOKE_TOKEN = "smoke-secret";
    flush.mockResolvedValue(true);

    const { POST } = await import("../route");
    const response = await POST(
      new NextRequest("http://localhost/api/health/sentry", {
        method: "POST",
        headers: {
          authorization: "Bearer smoke-secret",
        },
      })
    );

    expect(response.status).toBe(200);
    expect(captureException).toHaveBeenCalledTimes(1);
    expect(flush).toHaveBeenCalledWith(2000);
    await expect(response.json()).resolves.toEqual({ ok: true, eventId: "event_123" });
  });
});
