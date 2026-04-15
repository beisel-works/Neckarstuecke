# POD Supplier Decision Record

**Task:** BEI-9  
**Date:** 2026-04-15  
**Status:** Decision made — Prodigi selected

---

## 1. Candidate Evaluation

| Criterion | Prodigi | Gelato | Printful |
|-----------|---------|--------|----------|
| Fine art / Hahnemühle paper | ✅ Explicit Hahnemühle FineArt SKUs | ⚠️ "Fine art" options, no Hahnemühle brand | ❌ No Hahnemühle |
| Archival inks (giclée) | ✅ Pigment-based giclée production | ✅ Pigment-based | ⚠️ Varies by facility |
| EU-based fulfilment | ✅ UK + EU labs (Netherlands, Germany) | ✅ Strong EU network | ⚠️ Primarily USA, EU capacity limited for fine art |
| German shipping speed | ✅ EU lab → 3–5 days | ✅ Local production → 2–4 days | ❌ Cross-Atlantic for fine art |
| REST API | ✅ v4.0, well-documented | ✅ Yes | ✅ Yes |
| Sandbox/test environment | ✅ Sandbox API key provided at signup | ✅ Yes | ✅ Yes |
| Webhook status events | ✅ `order.status.changed`, `shipment.complete` | ✅ Yes | ✅ Yes |
| Per-unit pricing transparency | ✅ Immediate quote via API | ⚠️ Requires account for pricing | ✅ Public pricing |

### Decision: **Prodigi**

Prodigi is the only candidate with explicit Hahnemühle FineArt paper SKUs — a brand commitment stated in `brand/brand-guidelines.md` ("Hahnemühle"). Their EU lab network (Netherlands fulfilment hub) meets the German shipping requirement. The v4.0 REST API is comprehensive and has a true sandbox mode.

Gelato is a valid fallback if Prodigi's Hahnemühle SKUs become unavailable; their production network is more geographically distributed. This integration is built as an adapter layer so swapping suppliers requires only `lib/pod/prodigi.ts` → `lib/pod/gelato.ts`.

---

## 2. Prodigi API Integration Specification

### 2.1 Base URL

```
Sandbox:    https://api.prodigi.com/v4.0
Production: https://api.prodigi.com/v4.0
```

Both environments use the same base URL; the environment is determined by the API key used (sandbox key vs. live key). There is no separate subdomain.

### 2.2 Authentication

All requests require an `X-API-Key` header:

```
X-API-Key: <PRODIGI_API_KEY>
```

Keys are scoped per account. Sandbox keys begin with `sandbox_`. Production keys are issued separately.

### 2.3 Order Creation Endpoint

**`POST /orders`**

#### Request headers

```
Content-Type: application/json
X-API-Key: <PRODIGI_API_KEY>
```

#### Request payload schema

```json
{
  "merchantReference": "NS-ORDER-<supabase-order-id>",
  "shippingMethod": "Standard",
  "recipient": {
    "name": "string",
    "address": {
      "line1": "string",
      "line2": "string | null",
      "postalOrZipCode": "string",
      "countryCode": "string (ISO 3166-1 alpha-2, e.g. \"DE\")",
      "townOrCity": "string",
      "stateOrCounty": "string | null"
    },
    "email": "string | null"
  },
  "items": [
    {
      "merchantReference": "<supabase-order-id>-item-<n>",
      "sku": "string (see §2.5 SKU map)",
      "copies": 1,
      "sizing": "fillPrintArea",
      "assets": [
        {
          "printArea": "default",
          "url": "https://cdn.neckarstücke.de/prints/<slug>/print-file.pdf"
        }
      ]
    }
  ]
}
```

#### Minimal required fields

`merchantReference`, `shippingMethod`, `recipient.name`, `recipient.address.line1`, `recipient.address.postalOrZipCode`, `recipient.address.countryCode`, `recipient.address.townOrCity`, at least one item with `sku`, `copies`, and `assets[0].url`.

#### Successful response (201 Created)

```json
{
  "outcome": "Created",
  "order": {
    "id": "ord_<prodigi-id>",
    "created": "2026-04-15T10:00:00Z",
    "status": {
      "stage": "InProgress",
      "issues": []
    },
    "merchantReference": "NS-ORDER-<uuid>",
    "shippingMethod": "Standard",
    "items": [...],
    "recipient": {...}
  }
}
```

The `order.id` must be persisted as `supplier_order_id` in the Supabase `orders` table.

#### Error responses

| HTTP status | `outcome` | Meaning |
|-------------|-----------|---------|
| 400 | `ValidationFailed` | Malformed payload — check required fields |
| 401 | `Unauthorised` | Invalid or missing API key |
| 404 | `SkuNotFound` | SKU does not exist in Prodigi catalogue |
| 422 | `AssetNotDownloadable` | Print file URL inaccessible |

### 2.4 Webhook Events (Prodigi → Neckarstücke)

Register a webhook endpoint in the Prodigi dashboard pointing to:
`https://neckarstücke.de/api/webhooks/prodigi`

| Event type | Trigger | Relevant fields |
|------------|---------|-----------------|
| `order.status.changed` | Status transitions (InProgress → Complete, Cancelled) | `order.id`, `order.status.stage` |
| `order.outcome.complete` | All items dispatched | `order.id` |
| `shipment.complete` | Package handed to carrier | `order.id`, `shipment.carrier.name`, `shipment.tracking.number`, `shipment.tracking.url` |

All webhook payloads are signed with `X-Prodigi-Signature` (HMAC-SHA256). Verify before processing.

### 2.5 SKU Mapping

Neckarstücke variants map to Prodigi SKUs as follows:

| Variant (internal) | Prodigi SKU | Notes |
|--------------------|-------------|-------|
| Print 30×40 cm | `GLOBAL-HAHNEM-PHOTO-RAG-FT-30X40` | Hahnemühle Photo Rag, flat |
| Print 50×70 cm | `GLOBAL-HAHNEM-PHOTO-RAG-FT-50X70` | Hahnemühle Photo Rag, flat |
| Print 70×100 cm | `GLOBAL-HAHNEM-PHOTO-RAG-FT-70X100` | Hahnemühle Photo Rag, flat |
| Framed 30×40 cm | `GLOBAL-HAHNEM-PHOTO-RAG-OAK-30X40` | Hahnemühle Photo Rag, oak frame |
| Framed 50×70 cm | `GLOBAL-HAHNEM-PHOTO-RAG-OAK-50X70` | Hahnemühle Photo Rag, oak frame |

> **Note:** Exact SKU strings must be confirmed against the live Prodigi catalogue endpoint (`GET /catalogue`) once a sandbox account is active. The pattern above matches Prodigi's documented naming convention but final SKU values may differ. Update `lib/pod/prodigi.ts` constants once verified.

### 2.6 Idempotency

Prodigi does not natively support an idempotency key. Duplicate-order prevention must be implemented at the Trigger.dev job level by checking `supplier_order_id IS NOT NULL` in the `orders` table before placing a new order.

---

## 3. Environment Variables

Add the following to `.env.local` (already added to `.env.example`):

```bash
# POD Supplier — Prodigi
# Sandbox key starts with sandbox_ ; production key starts with live_
PRODIGI_API_KEY=sandbox_...

# Webhook signing secret (from Prodigi dashboard → Webhooks)
PRODIGI_WEBHOOK_SECRET=...
```

---

## 4. Sandbox Account Setup

**Manual step required:** Create a free Prodigi account at prodigi.com and retrieve:
1. A sandbox API key from the dashboard (API Keys section)
2. Register a webhook endpoint and obtain the signing secret

Store both values in `.env.local` as shown above. The Trigger.dev job uses `PRODIGI_API_KEY` server-side only — never exposed to the browser.

---

## 5. Test API Call — Documented Response Structure

The following `GET /catalogue` call confirms API connectivity and key validity. Run once after sandbox account is created:

```bash
curl -s \
  -H "X-API-Key: $PRODIGI_API_KEY" \
  "https://api.prodigi.com/v4.0/catalogue" \
  | jq '{totalCount: .totalCount, firstSku: .products[0].sku}'
```

Expected response shape:
```json
{
  "totalCount": 1234,
  "firstSku": "GLOBAL-FAP-..."
}
```

A `200 OK` with `totalCount > 0` confirms the key is valid and the integration is ready for order submission.

---

## 6. Adapter Architecture

The Trigger.dev fulfillment job calls a supplier adapter, not the Prodigi API directly:

```
trigger/fulfill-order.ts
  → lib/pod/index.ts        (PodAdapter interface)
  → lib/pod/prodigi.ts      (Prodigi implementation)
```

This means swapping to Gelato requires only a new `lib/pod/gelato.ts` file and a single env var change (`POD_PROVIDER=gelato`), with no changes to the Trigger.dev job logic.
