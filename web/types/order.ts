/**
 * TypeScript types for the order and fulfilment data model.
 * Mirrors the Supabase `orders` and `order_items` tables (migration 003).
 */

export type FulfilmentStatus =
  | "paid"
  | "submitted"
  | "in_production"
  | "shipped"
  | "delivered"
  | "failed";

/** A single line item stored in the normalised order_items table. */
export interface OrderItem {
  id: string;
  order_id: string;
  product_sku: string;          // internal SKU, e.g. "ns-01-30x40-print"
  supplier_product_id: string | null;  // POD supplier SKU, set when order is submitted
  quantity: number;
  unit_price_cents: number;
  currency: string;
  description: string | null;
  created_at: string;
}

export interface EditionNumber {
  id: string;
  print_id: string;
  order_id: string | null;
  edition_number: number;
  created_at: string;
}

export interface EditionsRemainingRow {
  print_id: string;
  editions_remaining: number;
}

export type CoaStatus = "pending" | "printed" | "dispatched";

export interface CertificateOfAuthenticity {
  id: string;
  order_item_id: string;
  edition_number: number;
  print_slug: string;
  format_label: string;
  buyer_name: string;
  pdf_storage_path: string | null;
  coa_status: CoaStatus;
  created_at: string;
  updated_at: string;
}

/** Order record in Supabase. */
export interface Order {
  id: string;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  status: FulfilmentStatus;
  customer_email: string | null;
  /** Shipping address as returned by Stripe (JSONB). */
  shipping_address: ShippingAddress | null;
  /** Denormalised line items from the Stripe session (JSONB). Kept for backward compat. */
  line_items: StripeLineItem[];
  total_cents: number | null;
  currency: string;
  supplier_order_id: string | null;
  tracking_number: string | null;
  carrier: string | null;
  created_at: string;
  updated_at: string;
}

/** Order with resolved order_items rows. */
export type OrderWithItems = Order & { items: OrderItem[] };

/** Stripe shipping address shape (subset of Stripe.Address). */
export interface ShippingAddress {
  line1: string | null;
  line2?: string | null;
  city: string | null;
  state?: string | null;
  postal_code: string | null;
  country: string | null;
}

/** Denormalised line item stored in the orders.line_items JSONB column. */
export interface StripeLineItem {
  description: string;
  quantity: number;
  amount_total: number;
  currency: string;
}

/** Payload sent to the Trigger.dev fulfilment job. */
export interface FulfilOrderPayload {
  orderId: string;
}

/** Result returned by the POD adapter's placeOrder method. */
export interface PodOrderResult {
  supplierOrderId: string;
}
