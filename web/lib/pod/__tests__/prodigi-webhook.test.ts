import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  buildProdigiOrderUpdate,
  mapProdigiStageToStatus,
  shouldAdvanceOrderStatus,
  verifyProdigiSignature,
} from "@/app/api/webhooks/prodigi/route";

describe("verifyProdigiSignature", () => {
  it("accepts a hex-encoded HMAC signature", () => {
    const body = JSON.stringify({ event: "shipment.complete" });
    const secret = "prodigi-secret";
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    expect(verifyProdigiSignature(body, signature, secret)).toBe(true);
  });

  it("accepts a base64-encoded HMAC signature with sha256 prefix", () => {
    const body = JSON.stringify({ event: "shipment.complete" });
    const secret = "prodigi-secret";
    const signature = createHmac("sha256", secret).update(body).digest("base64");

    expect(verifyProdigiSignature(body, `sha256=${signature}`, secret)).toBe(true);
  });
});

describe("mapProdigiStageToStatus", () => {
  it("maps InProgress to in_production", () => {
    expect(mapProdigiStageToStatus("InProgress")).toBe("in_production");
  });

  it("maps cancelled stages to failed", () => {
    expect(mapProdigiStageToStatus("Cancelled")).toBe("failed");
  });
});

describe("buildProdigiOrderUpdate", () => {
  it("maps shipment.complete to shipped with tracking data", () => {
    expect(
      buildProdigiOrderUpdate({
        event: "shipment.complete",
        order: { id: "ord_123" },
        shipment: {
          carrier: { name: "DHL" },
          tracking: { number: "TRACK-123" },
        },
      })
    ).toEqual({
      supplierOrderId: "ord_123",
      status: "shipped",
      tracking_number: "TRACK-123",
      carrier: "DHL",
    });
  });

  it("maps order.status.changed to in_production", () => {
    expect(
      buildProdigiOrderUpdate({
        event: "order.status.changed",
        order: {
          id: "ord_456",
          status: { stage: "InProgress" },
        },
      })
    ).toEqual({
      supplierOrderId: "ord_456",
      status: "in_production",
    });
  });

  it("ignores unknown stages", () => {
    expect(
      buildProdigiOrderUpdate({
        event: "order.status.changed",
        order: {
          id: "ord_789",
          status: { stage: "Queued" },
        },
      })
    ).toBeNull();
  });
});

describe("shouldAdvanceOrderStatus", () => {
  it("advances forward through the fulfilment lifecycle", () => {
    expect(shouldAdvanceOrderStatus("submitted", "in_production")).toBe(true);
    expect(shouldAdvanceOrderStatus("in_production", "shipped")).toBe(true);
  });

  it("ignores stale regressions", () => {
    expect(shouldAdvanceOrderStatus("shipped", "in_production")).toBe(false);
    expect(shouldAdvanceOrderStatus("delivered", "shipped")).toBe(false);
  });

  it("allows failure before shipment but not after shipment", () => {
    expect(shouldAdvanceOrderStatus("submitted", "failed")).toBe(true);
    expect(shouldAdvanceOrderStatus("shipped", "failed")).toBe(false);
  });

  it("allows recovery from a failed state", () => {
    expect(shouldAdvanceOrderStatus("failed", "in_production")).toBe(true);
  });
});
