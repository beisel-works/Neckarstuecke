/**
 * Prodigi POD adapter.
 *
 * Implements the `PodAdapter` interface for the Prodigi v4.0 REST API.
 * See `docs/pod-supplier-decision.md` for full API specification and SKU map.
 *
 * Environment variables required:
 *   PRODIGI_API_KEY       — Prodigi API key for sandbox or live.
 *   PRODIGI_API_BASE_URL — optional full base URL, e.g.
 *                          https://api.sandbox.prodigi.com/v4.0
 */

import type { PodAdapter, PodOrderPayload, PodOrderResult } from "./index";

const PRODIGI_BASE_URL = "https://api.prodigi.com/v4.0";

function normalizeProdigiBaseUrl(baseUrl?: string): string {
  const trimmed = (baseUrl ?? PRODIGI_BASE_URL).replace(/\/+$/, "");
  return trimmed.endsWith("/v4.0") ? trimmed : `${trimmed}/v4.0`;
}

// ---------------------------------------------------------------------------
// SKU map: internal size_label + format → Prodigi catalogue SKU
//
// NOTE: Exact SKU strings must be confirmed against the live Prodigi catalogue
// endpoint (GET /catalogue) once a sandbox account is active.  The pattern
// below matches Prodigi's documented naming convention.
// ---------------------------------------------------------------------------

/** Map key: `${format}:${sizeLabel}` (both normalised to lower-case ASCII). */
const PRODIGI_SKU_MAP: Record<string, string> = {
  "print:30x40": "GLOBAL-HAHNEM-PHOTO-RAG-FT-30X40",
  "print:50x70": "GLOBAL-HAHNEM-PHOTO-RAG-FT-50X70",
  "print:70x100": "GLOBAL-HAHNEM-PHOTO-RAG-FT-70X100",
  "framed:30x40": "GLOBAL-HAHNEM-PHOTO-RAG-OAK-30X40",
  "framed:50x70": "GLOBAL-HAHNEM-PHOTO-RAG-OAK-50X70",
};

/**
 * Resolves the Prodigi SKU from a variant's format and size label.
 *
 * @param format - "print" | "framed"
 * @param sizeLabel - e.g. "30×40 cm"
 * @returns Prodigi SKU string
 * @throws if no mapping is found
 */
export function resolveProdigiSku(format: string, sizeLabel: string): string {
  // Normalise: "30×40 cm" → "30x40"
  const normSize = sizeLabel
    .replace("×", "x")
    .replace(/\s*cm\s*$/i, "")
    .trim();
  const key = `${format.toLowerCase()}:${normSize}`;
  const sku = PRODIGI_SKU_MAP[key];
  if (!sku) {
    throw new Error(
      `No Prodigi SKU found for format="${format}" size="${sizeLabel}" (key="${key}"). ` +
        `Update PRODIGI_SKU_MAP in lib/pod/prodigi.ts.`
    );
  }
  return sku;
}

// ---------------------------------------------------------------------------
// Prodigi API response shapes (subset of fields we care about)
// ---------------------------------------------------------------------------

interface ProdigiOrderResponse {
  outcome: string;
  order?: {
    id: string;
    status?: { stage: string };
  };
  traceParent?: string;
}

// ---------------------------------------------------------------------------
// Adapter implementation
// ---------------------------------------------------------------------------

export class ProdigiAdapter implements PodAdapter {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey?: string, baseUrl?: string) {
    const key = apiKey ?? process.env.PRODIGI_API_KEY;
    if (!key) {
      throw new Error("PRODIGI_API_KEY is not configured.");
    }
    this.apiKey = key;
    this.baseUrl = normalizeProdigiBaseUrl(
      baseUrl ?? process.env.PRODIGI_API_BASE_URL
    );
  }

  async placeOrder(payload: PodOrderPayload): Promise<PodOrderResult> {
    const body = {
      merchantReference: `NS-ORDER-${payload.orderId}`,
      idempotencyKey: payload.orderId,
      callbackUrl: process.env.PRODIGI_CALLBACK_URL ?? undefined,
      shippingMethod: "Standard",
      recipient: {
        name: payload.recipient.name,
        email: payload.recipient.email ?? undefined,
        address: {
          line1: payload.recipient.address.line1,
          line2: payload.recipient.address.line2 ?? undefined,
          postalOrZipCode: payload.recipient.address.postalOrZipCode,
          countryCode: payload.recipient.address.countryCode,
          townOrCity: payload.recipient.address.townOrCity,
          stateOrCounty: payload.recipient.address.stateOrCounty ?? undefined,
        },
      },
      items: payload.items.map((item, index) => ({
        merchantReference: `${payload.orderId}-item-${index}`,
        sku: item.sku,
        copies: item.copies,
        sizing: "fillPrintArea",
        assets: [
          {
            printArea: "default",
            url: item.printFileUrl,
          },
        ],
      })),
    };

    const response = await fetch(`${this.baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": this.apiKey,
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as ProdigiOrderResponse;

    if (!response.ok || data.outcome !== "Created") {
      throw new Error(
        `Prodigi order placement failed: HTTP ${response.status}, outcome="${data.outcome ?? "unknown"}"`
      );
    }

    if (!data.order?.id) {
      throw new Error("Prodigi response missing order.id — cannot persist supplier_order_id.");
    }

    return { supplierOrderId: data.order.id };
  }
}

/** Singleton lazy-initialised adapter instance. */
let _adapter: ProdigiAdapter | undefined;

export function getPodAdapter(): PodAdapter {
  _adapter ??= new ProdigiAdapter();
  return _adapter;
}
