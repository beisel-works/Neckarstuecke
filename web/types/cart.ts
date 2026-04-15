import type { PrintFormat } from "./print";

/** A single line item in the customer's cart. */
export interface CartItem {
  /** Unique key for this line — `variantId` is sufficient since one variant = one line. */
  variantId: string;
  printId: string;
  slug: string;
  title: string;
  /** URL for the small thumbnail shown in the cart panel. */
  imageUrl: string | null;
  sizeLabel: string;
  format: PrintFormat;
  priceInCents: number;
  quantity: number;
}

/**
 * Line item shape expected by the Stripe checkout API route (BEI-36).
 * Defined here so both the cart context and the API route share the contract.
 */
export interface CheckoutLineItem {
  variantId: string;
  quantity: number;
  priceInCents: number;
}

/** Payload posted to /api/checkout when the customer clicks "Zur Kasse". */
export interface CheckoutPayload {
  lineItems: CheckoutLineItem[];
}
