import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("proxy", () => {
  const previousUsername = process.env.COA_ADMIN_USERNAME;
  const previousPassword = process.env.COA_ADMIN_PASSWORD;

  beforeEach(() => {
    vi.resetModules();
    process.env.COA_ADMIN_USERNAME = "admin";
    process.env.COA_ADMIN_PASSWORD = "secret";
  });

  afterEach(() => {
    process.env.COA_ADMIN_USERNAME = previousUsername;
    process.env.COA_ADMIN_PASSWORD = previousPassword;
    vi.restoreAllMocks();
  });

  it("returns a basic auth challenge without credentials", async () => {
    const { proxy } = await import("../../proxy");
    const response = proxy(
      new NextRequest("http://localhost/admin/coa", {
        headers: {},
      })
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("www-authenticate")).toBe(
      'Basic realm="COA Admin", charset="UTF-8"'
    );
  });

  it("allows requests with valid basic auth", async () => {
    const { proxy } = await import("../../proxy");
    const response = proxy(
      new NextRequest("http://localhost/admin/coa", {
        headers: {
          authorization: "Basic YWRtaW46c2VjcmV0",
        },
      })
    );

    expect(response.status).toBe(200);
  });
});
