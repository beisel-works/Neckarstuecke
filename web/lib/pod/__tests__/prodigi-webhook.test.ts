import { describe, expect, it } from "vitest";
import {
  buildProdigiOrderUpdate,
  mapProdigiStageToStatus,
  shouldAdvanceOrderStatus,
} from "@/app/api/webhooks/prodigi/route";

describe("mapProdigiStageToStatus", () => {
  it("maps InProgress to in_production", () => {
    expect(mapProdigiStageToStatus("InProgress")).toBe("in_production");
  });

  it("maps Complete to shipped", () => {
    expect(mapProdigiStageToStatus("Complete")).toBe("shipped");
  });

  it("maps cancelled stages to failed", () => {
    expect(mapProdigiStageToStatus("Cancelled")).toBe("failed");
  });
});

describe("buildProdigiOrderUpdate", () => {
  it("maps CloudEvent shipment callbacks to shipped with tracking data", () => {
    expect(
      buildProdigiOrderUpdate({
        type: "com.prodigi.order.shipment.created",
        subject: "ord_123",
        data: {
          id: "ord_123",
          shipments: [
            {
              carrier: { name: "DHL" },
              tracking: { number: "TRACK-123" },
            },
          ],
        },
      })
    ).toEqual({
      supplierOrderId: "ord_123",
      status: "shipped",
      tracking_number: "TRACK-123",
      carrier: "DHL",
    });
  });

  it("maps CloudEvent status callbacks to in_production", () => {
    expect(
      buildProdigiOrderUpdate({
        type: "com.prodigi.order.status.stage.changed#InProgress",
        subject: "ord_456",
        data: {
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
        type: "com.prodigi.order.status.stage.changed#Queued",
        data: {
          id: "ord_789",
          status: { stage: "Queued" },
        },
      })
    ).toBeNull();
  });

  it("supports the nested data.order callback variant", () => {
    expect(
      buildProdigiOrderUpdate({
        type: "com.prodigi.order.status.stage.changed#Complete",
        subject: "ord_999",
        data: {
          order: {
            id: "ord_999",
            status: { stage: "Complete" },
          },
        },
      })
    ).toEqual({
      supplierOrderId: "ord_999",
      status: "shipped",
    });
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
