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
Sandbox:    https://api.sandbox.prodigi.com/v4.0
Production: https://api.prodigi.com/v4.0
```

Sandbox and live use different API hosts. The integration should point at the correct host explicitly via `PRODIGI_API_BASE_URL`.

### 2.2 Authentication

All requests require an `X-API-Key` header:

```
X-API-Key: <PRODIGI_API_KEY>
```

The API key is sent in the `X-API-Key` header. Prodigi's current docs show UUID-like keys in examples; do not assume a specific prefix format in code.

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
  "idempotencyKey": "<supabase-order-id>",
  "callbackUrl": "https://neckarstuecke.de/api/webhooks/prodigi",
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

Register a callback endpoint in the Prodigi dashboard pointing to:
`https://neckarstuecke.de/api/webhooks/prodigi`

| Event type | Trigger | Relevant fields |
|------------|---------|-----------------|
| `com.prodigi.order.status.stage.changed#InProgress` | Status transition to fulfilment | `subject`, `data.status.stage` |
| `com.prodigi.order.status.stage.changed#Complete` | All shipments sent | `subject`, `data.status.stage` |
| shipment callback type containing `shipment` | Package handed to carrier | `subject`, `data.shipments[]` |

Prodigi documents callbacks as unsigned CloudEvents. There is no documented webhook signing secret in the v4 reference. The callback payload includes the full order object in `data`, and `subject` contains the Prodigi order id.

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

Prodigi order objects support `idempotencyKey`. We also keep the Trigger.dev-side guard by checking `supplier_order_id IS NOT NULL` in the `orders` table before placing a new order.

---

## 3. Environment Variables

Add the following to `.env.local` (already added to `.env.example`):

```bash
# POD Supplier — Prodigi
PRODIGI_API_KEY=<prodigi-api-key>
PRODIGI_API_BASE_URL=https://api.sandbox.prodigi.com/v4.0
PRODIGI_CALLBACK_URL=https://neckarstuecke.de/api/webhooks/prodigi
```

---

## 4. Sandbox Account Setup

**Manual step required:** Create a free Prodigi account at prodigi.com and retrieve:
1. A sandbox or live API key from the Prodigi dashboard
2. A callback URL configured either globally in merchant settings or per order via `callbackUrl`

Store the API key in `.env.local` as shown above. The Trigger.dev job uses `PRODIGI_API_KEY` server-side only — never exposed to the browser.

---

## 5. Test API Call — Documented Response Structure

The following `GET /orders` call confirms API connectivity and key validity. Run once after the sandbox account is created:

```bash
curl -s \
  -H "X-API-Key: $PRODIGI_API_KEY" \
  "$PRODIGI_API_BASE_URL/orders" \
  | jq '{outcome: .outcome, count: (.orders | length)}'
```

Expected response shape:
```json
{
  "outcome": "Ok",
  "count": 0
}
```

A `200 OK` with `outcome = "Ok"` confirms the key is valid and the integration is reachable.

---

## 6. Adapter Architecture

The Trigger.dev fulfillment job calls a supplier adapter, not the Prodigi API directly:

```
trigger/fulfill-order.ts
  → lib/pod/index.ts        (PodAdapter interface)
  → lib/pod/prodigi.ts      (Prodigi implementation)
```

This means swapping to Gelato requires only a new `lib/pod/gelato.ts` file and a single env var change (`POD_PROVIDER=gelato`), with no changes to the Trigger.dev job logic.
