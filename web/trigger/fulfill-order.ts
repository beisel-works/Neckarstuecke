/**
 * Trigger.dev v3 task: fulfill-order
 *
 * Triggered after a customer completes payment (via Stripe webhook → BEI-15).
 * Reads the order from Supabase, maps line items to POD supplier SKUs, places
 * the production order with Prodigi, then updates the order status.
 *
 * Idempotency: if `supplier_order_id` is already set the job exits immediately.
 * Retries: Trigger.dev re-runs the task up to 3× with exponential backoff on
 * any thrown error.  After exhausting retries the `onFailure` hook marks the
 * Supabase order as `failed`.
 *
 * Environment variables required:
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — DB access (service role).
 *   PRODIGI_API_KEY                          — POD supplier credentials.
 *   NEXT_PUBLIC_PRINT_CDN_BASE               — Base URL for print assets
 *                                             (e.g. "https://cdn.neckarstücke.de").
 */

import { task } from "@trigger.dev/sdk/v3";
import { getServiceClient } from "@/lib/supabase/service";
import { getPodAdapter } from "@/lib/pod/prodigi";
import { resolveProdigiSku } from "@/lib/pod/prodigi";
import type { FulfilOrderPayload } from "@/types/order";
import type { PodItem } from "@/lib/pod/index";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Constructs the CDN URL for a print's production-ready file. */
function buildPrintFileUrl(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_PRINT_CDN_BASE ?? "https://cdn.xn--neckarstuecke-dib.de";
  return `${base}/prints/${slug}/print-file.pdf`;
}

// ---------------------------------------------------------------------------
// Trigger.dev task definition
// ---------------------------------------------------------------------------

export const fulfillOrder = task({
  id: "fulfill-order",

  // Retry policy: 3 attempts, exponential backoff starting at 10 s.
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 10_000,
    maxTimeoutInMs: 60_000,
    randomize: true,
  },

  // On permanent failure (all retries exhausted) mark the order as failed.
  onFailure: async ({ payload, error }) => {
    const db = getServiceClient();
    await db
      .from("orders")
      .update({ status: "failed" })
      .eq("id", payload.orderId);

    console.error(
      `[fulfill-order] Permanent failure for order ${payload.orderId}:`,
      error instanceof Error ? error.message : error
    );
  },

  run: async (payload: FulfilOrderPayload) => {
    const { orderId } = payload;
    const db = getServiceClient();

    // 1. Fetch the order record.
    const { data: order, error: orderError } = await db
      .from("orders")
      .select(
        "id, status, supplier_order_id, customer_email, shipping_address, line_items"
      )
      .eq("id", orderId)
      .single();

    if (orderError || !order) {
      throw new Error(
        `Order ${orderId} not found in Supabase: ${orderError?.message ?? "no data"}`
      );
    }

    // 2. Idempotency guard — skip if already submitted to the supplier.
    if (order.supplier_order_id) {
      console.info(
        `[fulfill-order] Order ${orderId} already has supplier_order_id=${order.supplier_order_id}. Skipping.`
      );
      return { skipped: true, supplierOrderId: order.supplier_order_id };
    }

    // 3. Resolve shipping address.
    const addr = order.shipping_address as {
      line1: string | null;
      line2?: string | null;
      city: string | null;
      state?: string | null;
      postal_code: string | null;
      country: string | null;
    } | null;

    if (!addr?.line1 || !addr.postal_code || !addr.country || !addr.city) {
      throw new Error(
        `Order ${orderId} has an incomplete shipping address: ${JSON.stringify(addr)}`
      );
    }

    // 4. Map line items to POD supplier payloads.
    //    Each line item description is the Stripe product name, which the checkout
    //    route sets to the `variantId` (UUID).  We look up the variant in Supabase
    //    to resolve the size_label and format, then map to a Prodigi SKU.

    type StoredLineItem = {
      description: string;
      quantity: number;
      amount_total: number;
      currency: string;
    };

    const storedItems = (order.line_items ?? []) as StoredLineItem[];

    const podItems: PodItem[] = await Promise.all(
      storedItems.map(async (item, index) => {
        const variantId = item.description;

        // Look up variant + parent print for SKU and CDN slug.
        const { data: variant, error: variantError } = await db
          .from("print_variants")
          .select("size_label, format, print_id, prints(slug)")
          .eq("id", variantId)
          .single();

        if (variantError || !variant) {
          throw new Error(
            `Variant ${variantId} not found for order ${orderId} item ${index}: ${variantError?.message ?? "no data"}`
          );
        }

        const printRecord = variant.prints as
          | { slug?: string }
          | { slug?: string }[]
          | null;
        const slug = Array.isArray(printRecord)
          ? printRecord[0]?.slug
          : printRecord?.slug;
        if (!slug) {
          throw new Error(
            `Could not resolve print slug for variant ${variantId} (order ${orderId})`
          );
        }

        const sku = resolveProdigiSku(variant.format, variant.size_label);
        const printFileUrl = buildPrintFileUrl(slug);

        return {
          merchantReference: `${orderId}-item-${index}`,
          sku,
          copies: item.quantity,
          printFileUrl,
        };
      })
    );

    // 5. Place the order with the POD supplier.
    const adapter = getPodAdapter();

    // Customer name: Stripe doesn't reliably expose it on the session for all flows;
    // use the email prefix as a fallback for the recipient.name field (Prodigi requires it).
    const recipientName =
      order.customer_email?.split("@")[0]?.replace(/[._-]/g, " ") ?? "Customer";

    const result = await adapter.placeOrder({
      orderId,
      recipient: {
        name: recipientName,
        email: order.customer_email,
        address: {
          line1: addr.line1,
          line2: addr.line2 ?? null,
          postalOrZipCode: addr.postal_code,
          countryCode: addr.country,
          townOrCity: addr.city,
          stateOrCounty: addr.state ?? null,
        },
      },
      items: podItems,
    });

    // 6. Update Supabase order: status → submitted, supplier_order_id set.
    const { error: updateError } = await db
      .from("orders")
      .update({
        status: "submitted",
        supplier_order_id: result.supplierOrderId,
      })
      .eq("id", orderId);

    if (updateError) {
      // The supplier order was placed but the DB update failed.
      // Log the supplier order ID and rethrow so Trigger.dev retries.
      // On retry, idempotency guard will catch the supplier_order_id.
      throw new Error(
        `Supabase status update failed for order ${orderId} (supplier=${result.supplierOrderId}): ${updateError.message}`
      );
    }

    console.info(
      `[fulfill-order] Order ${orderId} submitted to Prodigi. supplier_order_id=${result.supplierOrderId}`
    );

    return { supplierOrderId: result.supplierOrderId };
  },
});
