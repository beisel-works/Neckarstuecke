import { describe, expect, it, vi } from "vitest";
import {
  ProdigiAdapter,
  resolveProdigiProduct,
  resolveProdigiSku,
} from "@/lib/pod/prodigi";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("resolveProdigiSku", () => {
  it("maps loose German Etching prints to the GLOBAL-HGE family", () => {
    expect(resolveProdigiSku("print", "30×40 cm")).toBe("GLOBAL-HGE-12X16");
    expect(resolveProdigiSku("print", "50×70 cm")).toBe("GLOBAL-HGE-20X28");
    expect(resolveProdigiSku("print", "70×100 cm")).toBe("GLOBAL-HGE-28X40");
  });

  it("maps framed variants to the classic frame family", () => {
    expect(resolveProdigiSku("framed", "30×40 cm")).toBe("GLOBAL-CFP-12X16");
    expect(resolveProdigiSku("framed", "50×70 cm")).toBe("GLOBAL-CFP-20X28");
    expect(resolveProdigiSku("framed", "70×100 cm")).toBe("GLOBAL-CFP-28X40");
  });
});

describe("resolveProdigiProduct", () => {
  it("keeps loose prints on GLOBAL-HGE without extra attributes", async () => {
    await expect(
      resolveProdigiProduct("print", "30×40 cm", "DE")
    ).resolves.toEqual({ sku: "GLOBAL-HGE-12X16" });
  });

  it("uses HGE first for framed orders when Prodigi quotes it", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ outcome: "Created" }));

    await expect(
      resolveProdigiProduct("framed", "30×40 cm", "DE", {
        apiKey: "test-key",
        fetchImpl,
      })
    ).resolves.toEqual({
      sku: "GLOBAL-CFP-12X16",
      attributes: {
        paperType: "HGE",
        color: "natural",
      },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("falls back to EMA when the HGE quote is not available", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ outcome: "EntityNotFound" }))
      .mockResolvedValueOnce(jsonResponse({ outcome: "Created" }));

    await expect(
      resolveProdigiProduct("framed", "50×70 cm", "DE", {
        apiKey: "test-key",
        fetchImpl,
      })
    ).resolves.toEqual({
      sku: "GLOBAL-CFP-20X28",
      attributes: {
        paperType: "EMA",
        color: "natural",
      },
    });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("throws when no framed paper can be quoted", async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(jsonResponse({ outcome: "EntityNotFound" }))
      .mockResolvedValueOnce(jsonResponse({ outcome: "EntityNotFound" }));

    await expect(
      resolveProdigiProduct("framed", "30×40 cm", "DE", {
        apiKey: "test-key",
        fetchImpl,
      })
    ).rejects.toThrow(/No Prodigi framed paper is available/);
  });
});

describe("ProdigiAdapter.placeOrder", () => {
  it("passes item attributes through to the Prodigi order payload", async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ outcome: "Created", order: { id: "ord_123" } }));
    const originalFetch = globalThis.fetch;
    globalThis.fetch = fetchMock;

    try {
      const adapter = new ProdigiAdapter(
        "test-key",
        "https://api.prodigi.com/v4.0"
      );

      await expect(
        adapter.placeOrder({
          orderId: "order-1",
          recipient: {
            name: "Test Customer",
            email: "test@example.com",
            address: {
              line1: "Teststr. 1",
              line2: null,
              postalOrZipCode: "69117",
              countryCode: "DE",
              townOrCity: "Heidelberg",
              stateOrCounty: null,
            },
          },
          items: [
            {
              merchantReference: "ignored-by-adapter",
              sku: "GLOBAL-CFP-12X16",
              attributes: {
                paperType: "HGE",
                color: "natural",
              },
              copies: 1,
              printFileUrl: "https://cdn.example.com/prints/test.pdf",
            },
          ],
        })
      ).resolves.toEqual({ supplierOrderId: "ord_123" });

      const request = fetchMock.mock.calls[0]?.[1];
      expect(request).toBeDefined();
      const body = JSON.parse(String(request?.body)) as {
        items: Array<{ attributes?: Record<string, string> }>;
      };
      expect(body.items[0]?.attributes).toEqual({
        paperType: "HGE",
        color: "natural",
      });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
