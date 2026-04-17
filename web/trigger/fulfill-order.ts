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
import { generateCoaPdf } from "@/lib/coa/generate-pdf";
import { uploadCoaPdf } from "@/lib/coa/upload-pdf";
import { getServiceClient } from "@/lib/supabase/service";
import { getPodAdapter } from "@/lib/pod/prodigi";
import { resolveProdigiProduct } from "@/lib/pod/prodigi";
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
    const destinationCountryCode = addr.country;

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

        const product = await resolveProdigiProduct(
          variant.format,
          variant.size_label,
          destinationCountryCode
        );
        const printFileUrl = buildPrintFileUrl(slug);

        return {
          merchantReference: `${orderId}-item-${index}`,
          sku: product.sku,
          attributes: product.attributes,
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

    try {
      const { data: orderItems, error: orderItemsError } = await db
        .from("order_items")
        .select("id, quantity, description, created_at")
        .eq("order_id", orderId)
        .order("created_at");

      if (orderItemsError) {
        throw new Error(orderItemsError.message);
      }

      const variantIds = (orderItems ?? [])
        .map((item) => item.description)
        .filter((value): value is string => typeof value === "string" && value.length > 0);
      const { data: variantRows, error: variantRowsError } = await db
        .from("print_variants")
        .select("id, print_id, size_label, format, prints(title, slug)")
        .in("id", variantIds);

      if (variantRowsError) {
        throw new Error(variantRowsError.message);
      }

      const variantsById = new Map(
        (
          (variantRows ?? []) as Array<{
            id: string;
            print_id: string;
            size_label: string;
            format: string;
            prints: { title?: string; slug?: string } | { title?: string; slug?: string }[] | null;
          }>
        ).map((variant) => [
          variant.id,
          {
            printId: variant.print_id,
            sizeLabel: variant.size_label,
            formatLabel:
              variant.format === "framed"
                ? `${variant.size_label}, Gerahmt`
                : `${variant.size_label}, Print`,
            printTitle: Array.isArray(variant.prints)
              ? variant.prints[0]?.title ?? variant.print_id
              : variant.prints?.title ?? variant.print_id,
            printSlug: Array.isArray(variant.prints)
              ? variant.prints[0]?.slug ?? ""
              : variant.prints?.slug ?? "",
          },
        ])
      );

      const { data: editionRows, error: editionRowsError } = await db
        .from("edition_numbers")
        .select("print_id, edition_number")
        .eq("order_id", orderId)
        .order("edition_number");

      if (editionRowsError) {
        throw new Error(editionRowsError.message);
      }

      const editionsByPrint = new Map<string, number[]>();
      for (const row of editionRows ?? []) {
        const editions = editionsByPrint.get(row.print_id) ?? [];
        editions.push(row.edition_number);
        editionsByPrint.set(row.print_id, editions);
      }

      const orderItemIds = (orderItems ?? []).map((item) => item.id);
      const { data: existingCertificates, error: existingCertificatesError } = await db
        .from("certificates_of_authenticity")
        .select("order_item_id, edition_number")
        .in("order_item_id", orderItemIds);

      if (existingCertificatesError) {
        throw new Error(existingCertificatesError.message);
      }

      const existingCertificateKeys = new Set(
        (existingCertificates ?? []).map(
          (certificate) => `${certificate.order_item_id}:${certificate.edition_number}`
        )
      );

      for (const item of orderItems ?? []) {
        const variantId = item.description;
        if (!variantId) {
          continue;
        }

        const variant = variantsById.get(variantId);
        if (!variant) {
          throw new Error(`Missing variant ${variantId} for COA generation.`);
        }

        const editions = editionsByPrint.get(variant.printId) ?? [];
        for (let copy = 0; copy < item.quantity; copy += 1) {
          const editionNumber = editions.shift();
          if (!editionNumber) {
            throw new Error(
              `Missing edition number for order ${orderId}, print ${variant.printId}.`
            );
          }

          const certificateKey = `${item.id}:${editionNumber}`;
          if (existingCertificateKeys.has(certificateKey)) {
            continue;
          }

          const { data: certificate, error: insertCertificateError } = await db
            .from("certificates_of_authenticity")
            .insert({
              order_item_id: item.id,
              edition_number: editionNumber,
              print_slug: variant.printSlug,
              format_label: variant.formatLabel,
              buyer_name: recipientName,
              coa_status: "pending",
            })
            .select("id")
            .single();

          if (insertCertificateError || !certificate) {
            throw new Error(
              `Failed to create COA record: ${insertCertificateError?.message ?? "no data"}`
            );
          }

          const pdfBytes = await generateCoaPdf({
            buyerName: recipientName,
            editionNumber,
            motifTitle: variant.printTitle,
            formatLabel: variant.formatLabel,
            issuedAt: new Date().toISOString().slice(0, 10),
          });
          const pdfStoragePath = await uploadCoaPdf(orderId, certificate.id, pdfBytes);

          const { error: updateCertificateError } = await db
            .from("certificates_of_authenticity")
            .update({
              pdf_storage_path: pdfStoragePath,
              coa_status: "printed",
            })
            .eq("id", certificate.id);

          if (updateCertificateError) {
            throw new Error(updateCertificateError.message);
          }

          existingCertificateKeys.add(certificateKey);
        }
      }
    } catch (coaError) {
      console.error(
        `[fulfill-order] COA creation failed for order ${orderId}:`,
        coaError instanceof Error ? coaError.message : coaError
      );
    }

    return { supplierOrderId: result.supplierOrderId };
  },
});
