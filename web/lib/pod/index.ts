/**
 * POD (Print-on-Demand) adapter interface.
 *
 * All supplier-specific implementations must conform to this interface.
 * Swapping suppliers requires only a new implementation file and a
 * POD_PROVIDER env-var change — the Trigger.dev job never changes.
 */

/** A shipping address in the normalised form expected by the POD adapter. */
export interface PodAddress {
  line1: string;
  line2: string | null;
  postalOrZipCode: string;
  countryCode: string;
  townOrCity: string;
  stateOrCounty: string | null;
}

/** A single print item in the POD order. */
export interface PodItem {
  /** Unique reference for this line item (used for idempotency tracking). */
  merchantReference: string;
  /** Supplier product SKU (e.g. "GLOBAL-HAHNEM-PHOTO-RAG-FT-30X40"). */
  sku: string;
  /** Number of copies to produce. */
  copies: number;
  /** Publicly accessible URL of the print-ready file (PDF/X-4 or high-res JPG). */
  printFileUrl: string;
}

/** Full payload passed to `PodAdapter.placeOrder`. */
export interface PodOrderPayload {
  /** Our internal order ID (used as the supplier's merchantReference). */
  orderId: string;
  recipient: {
    /** Customer full name. */
    name: string;
    /** Customer email for dispatch notifications (may be null). */
    email: string | null;
    address: PodAddress;
  };
  items: PodItem[];
}

/** Result returned by a successful `placeOrder` call. */
export interface PodOrderResult {
  /** Supplier-assigned order ID — must be persisted as `supplier_order_id`. */
  supplierOrderId: string;
}

/** Supplier adapter interface. Implemented by `lib/pod/prodigi.ts` (and future adapters). */
export interface PodAdapter {
  /**
   * Places a print production order with the supplier.
   * Must throw on any non-2xx response so the caller can retry / mark failed.
   */
  placeOrder(payload: PodOrderPayload): Promise<PodOrderResult>;
}
