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

import type {
  PodAdapter,
  PodItemAttributes,
  PodOrderPayload,
  PodOrderResult,
} from "./index";

const PRODIGI_BASE_URL = "https://api.prodigi.com/v4.0";
const PRODIGI_FRAME_COLOR = "natural";
const PRODIGI_FRAME_PAPER_TYPES = ["HGE", "EMA"] as const;
const PRODIGI_QUOTE_SHIPPING_METHOD = "standard";

function normalizeProdigiBaseUrl(baseUrl?: string): string {
  const trimmed = (baseUrl ?? PRODIGI_BASE_URL).replace(/\/+$/, "");
  return trimmed.endsWith("/v4.0") ? trimmed : `${trimmed}/v4.0`;
}

// ---------------------------------------------------------------------------
// SKU map: internal size_label + format → Prodigi catalogue SKU
//
// Loose Hahnemühle German Etching prints use the GLOBAL-HGE family. Framed
// variants use the GLOBAL-CFP family, but the live Product Details endpoint is
// inconsistent about paper support. We resolve framed paper per order via the
// Quote endpoint: try HGE first, then fall back to EMA if HGE is rejected.
// ---------------------------------------------------------------------------

/** Map key: `${format}:${sizeLabel}` (both normalised to lower-case ASCII). */
const PRODIGI_SKU_MAP: Record<string, { sku: string; framed: boolean }> = {
  "print:30x40": { sku: "GLOBAL-HGE-12X16", framed: false },
  "print:50x70": { sku: "GLOBAL-HGE-20X28", framed: false },
  "print:70x100": { sku: "GLOBAL-HGE-28X40", framed: false },
  "framed:30x40": { sku: "GLOBAL-CFP-12X16", framed: true },
  "framed:50x70": { sku: "GLOBAL-CFP-20X28", framed: true },
  "framed:70x100": { sku: "GLOBAL-CFP-28X40", framed: true },
};

interface ProdigiQuoteResponse {
  outcome: string;
}

export interface ResolvedProdigiProduct {
  sku: string;
  attributes?: PodItemAttributes;
}

interface ResolveProdigiProductOptions {
  apiKey?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function normalizeSizeLabel(sizeLabel: string): string {
  return sizeLabel.replace("×", "x").replace(/\s*cm\s*$/i, "").trim();
}

/**
 * Resolves the Prodigi SKU from a variant's format and size label.
 *
 * @param format - "print" | "framed"
 * @param sizeLabel - e.g. "30×40 cm"
 * @returns Prodigi SKU string
 * @throws if no mapping is found
 */
export function resolveProdigiSku(format: string, sizeLabel: string): string {
  const normSize = normalizeSizeLabel(sizeLabel);
  const key = `${format.toLowerCase()}:${normSize}`;
  const config = PRODIGI_SKU_MAP[key];
  if (!config) {
    throw new Error(
      `No Prodigi SKU found for format="${format}" size="${sizeLabel}" (key="${key}"). ` +
        `Update PRODIGI_SKU_MAP in lib/pod/prodigi.ts.`
    );
  }
  return config.sku;
}

async function canQuoteFramedPaperType(
  sku: string,
  paperType: (typeof PRODIGI_FRAME_PAPER_TYPES)[number],
  destinationCountryCode: string,
  {
    apiKey,
    baseUrl,
    fetchImpl = fetch,
  }: ResolveProdigiProductOptions = {}
): Promise<boolean> {
  const key = apiKey ?? process.env.PRODIGI_API_KEY;
  if (!key) {
    throw new Error("PRODIGI_API_KEY is not configured.");
  }

  const response = await fetchImpl(`${normalizeProdigiBaseUrl(baseUrl)}/quotes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Key": key,
    },
    body: JSON.stringify({
      shippingMethod: PRODIGI_QUOTE_SHIPPING_METHOD,
      destinationCountryCode: destinationCountryCode.toUpperCase(),
      items: [
        {
          sku,
          copies: 1,
          assets: [{ printArea: "default" }],
          attributes: {
            paperType,
            color: PRODIGI_FRAME_COLOR,
          },
        },
      ],
    }),
  });

  const data = (await response.json()) as ProdigiQuoteResponse;

  if (!response.ok) {
    if (response.status >= 500) {
      throw new Error(
        `Prodigi quote failed for sku="${sku}" paperType="${paperType}": HTTP ${response.status}, outcome="${data.outcome ?? "unknown"}"`
      );
    }
    return false;
  }

  return data.outcome === "Created";
}

export async function resolveProdigiProduct(
  format: string,
  sizeLabel: string,
  destinationCountryCode: string,
  options: ResolveProdigiProductOptions = {}
): Promise<ResolvedProdigiProduct> {
  const sku = resolveProdigiSku(format, sizeLabel);
  if (format.toLowerCase() !== "framed") {
    return { sku };
  }

  for (const paperType of PRODIGI_FRAME_PAPER_TYPES) {
    if (
      await canQuoteFramedPaperType(
        sku,
        paperType,
        destinationCountryCode,
        options
      )
    ) {
      return {
        sku,
        attributes: {
          paperType,
          color: PRODIGI_FRAME_COLOR,
        },
      };
    }
  }

  throw new Error(
    `No Prodigi framed paper is available for size="${sizeLabel}" to destination="${destinationCountryCode}".`
  );
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
        attributes: item.attributes,
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
