/**
 * Type-correctness tests for the order / fulfilment data model.
 * These tests verify that the TypeScript types enforce the schema
 * contract defined in migration 003.
 */

import { describe, it, expect } from "vitest";
import type {
  FulfilmentStatus,
  Order,
  OrderItem,
  OrderWithItems,
  ShippingAddress,
  StripeLineItem,
  FulfilOrderPayload,
  PodOrderResult,
} from "../order";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const VALID_FULFILMENT_STATUSES: FulfilmentStatus[] = [
  "paid",
  "submitted",
  "in_production",
  "shipped",
  "delivered",
  "failed",
];

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: "00000000-0000-0000-0000-000000000001",
    stripe_session_id: "cs_test_abc123",
    stripe_payment_intent_id: "pi_test_abc123",
    status: "paid",
    customer_email: "kunde@example.com",
    shipping_address: {
      line1: "Hauptstraße 1",
      city: "Heidelberg",
      postal_code: "69117",
      country: "DE",
    },
    line_items: [],
    total_cents: 6900,
    currency: "eur",
    supplier_order_id: null,
    tracking_number: null,
    carrier: null,
    created_at: "2026-04-15T12:00:00.000Z",
    updated_at: "2026-04-15T12:00:00.000Z",
    ...overrides,
  };
}

function makeOrderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: "00000000-0000-0000-0000-000000000010",
    order_id: "00000000-0000-0000-0000-000000000001",
    product_sku: "ns-01-30x40-print",
    supplier_product_id: null,
    quantity: 1,
    unit_price_cents: 6900,
    currency: "eur",
    description: "Minneburg — 30×40 cm Print",
    created_at: "2026-04-15T12:00:00.000Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// FulfilmentStatus
// ---------------------------------------------------------------------------

describe("FulfilmentStatus", () => {
  it("accepts all six valid status values", () => {
    expect(VALID_FULFILMENT_STATUSES).toHaveLength(6);
    const expected = ["paid", "submitted", "in_production", "shipped", "delivered", "failed"];
    expect(VALID_FULFILMENT_STATUSES).toEqual(expect.arrayContaining(expected));
  });

  it("includes the initial status 'paid' (set by webhook after checkout)", () => {
    expect(VALID_FULFILMENT_STATUSES).toContain("paid");
  });

  it("includes 'failed' for error state tracking", () => {
    expect(VALID_FULFILMENT_STATUSES).toContain("failed");
  });
});

// ---------------------------------------------------------------------------
// Order type
// ---------------------------------------------------------------------------

describe("Order", () => {
  it("constructs a minimal paid order without supplier fields", () => {
    const order = makeOrder();
    expect(order.status).toBe("paid");
    expect(order.supplier_order_id).toBeNull();
    expect(order.tracking_number).toBeNull();
    expect(order.carrier).toBeNull();
  });

  it("accepts a fulfilled order with all supplier fields populated", () => {
    const order = makeOrder({
      status: "shipped",
      supplier_order_id: "prodigi-12345",
      tracking_number: "DHL123456789",
      carrier: "DHL",
    });
    expect(order.status).toBe("shipped");
    expect(order.supplier_order_id).toBe("prodigi-12345");
    expect(order.tracking_number).toBe("DHL123456789");
    expect(order.carrier).toBe("DHL");
  });

  it("allows null shipping_address for guest orders without address collection", () => {
    const order = makeOrder({ shipping_address: null });
    expect(order.shipping_address).toBeNull();
  });

  it("stores line_items as an array (JSONB column)", () => {
    const lineItem: StripeLineItem = {
      description: "Minneburg 30×40 Print",
      quantity: 1,
      amount_total: 6900,
      currency: "eur",
    };
    const order = makeOrder({ line_items: [lineItem] });
    expect(order.line_items).toHaveLength(1);
    expect(order.line_items[0].amount_total).toBe(6900);
  });
});

// ---------------------------------------------------------------------------
// OrderItem type
// ---------------------------------------------------------------------------

describe("OrderItem", () => {
  it("constructs a valid order item", () => {
    const item = makeOrderItem();
    expect(item.product_sku).toBe("ns-01-30x40-print");
    expect(item.quantity).toBe(1);
    expect(item.unit_price_cents).toBe(6900);
  });

  it("allows null supplier_product_id before job runs", () => {
    const item = makeOrderItem({ supplier_product_id: null });
    expect(item.supplier_product_id).toBeNull();
  });

  it("accepts a supplier_product_id once the fulfilment job has run", () => {
    const item = makeOrderItem({ supplier_product_id: "GLOBAL-FAP-A3" });
    expect(item.supplier_product_id).toBe("GLOBAL-FAP-A3");
  });
});

// ---------------------------------------------------------------------------
// OrderWithItems
// ---------------------------------------------------------------------------

describe("OrderWithItems", () => {
  it("combines order fields with a normalised items array", () => {
    const order = makeOrder();
    const item = makeOrderItem({ order_id: order.id });
    const orderWithItems: OrderWithItems = { ...order, items: [item] };

    expect(orderWithItems.items).toHaveLength(1);
    expect(orderWithItems.items[0].order_id).toBe(order.id);
  });

  it("accepts an order with an empty items array", () => {
    const orderWithItems: OrderWithItems = { ...makeOrder(), items: [] };
    expect(orderWithItems.items).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// ShippingAddress
// ---------------------------------------------------------------------------

describe("ShippingAddress", () => {
  it("requires line1, city, postal_code, country", () => {
    const addr: ShippingAddress = {
      line1: "Neckarstraße 5",
      city: "Heidelberg",
      postal_code: "69117",
      country: "DE",
    };
    expect(addr.country).toBe("DE");
  });

  it("allows optional line2 and state fields", () => {
    const addr: ShippingAddress = {
      line1: "Neckarstraße 5",
      line2: "Apartment 2",
      city: "Heidelberg",
      state: "BW",
      postal_code: "69117",
      country: "DE",
    };
    expect(addr.line2).toBe("Apartment 2");
    expect(addr.state).toBe("BW");
  });
});

// ---------------------------------------------------------------------------
// FulfilOrderPayload
// ---------------------------------------------------------------------------

describe("FulfilOrderPayload", () => {
  it("carries only the orderId field", () => {
    const payload: FulfilOrderPayload = { orderId: "uuid-abc" };
    expect(Object.keys(payload)).toEqual(["orderId"]);
  });
});

// ---------------------------------------------------------------------------
// PodOrderResult
// ---------------------------------------------------------------------------

describe("PodOrderResult", () => {
  it("carries only the supplierOrderId field", () => {
    const result: PodOrderResult = { supplierOrderId: "prodigi-98765" };
    expect(result.supplierOrderId).toBe("prodigi-98765");
  });
});
