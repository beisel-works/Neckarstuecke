import { NextRequest, NextResponse } from "next/server";
import { getStripe, getStripePriceId } from "@/lib/stripe";
import { captureHandledException } from "@/lib/sentry";
import { getServiceClient } from "@/lib/supabase/service";
import type { CheckoutPayload } from "@/types/cart";
import type { PrintFormat } from "@/types/print";

/** Countries accepted for physical shipping at launch (EU + diaspora markets). */
const ALLOWED_COUNTRIES = [
  "AT",
  "BE",
  "CH",
  "CZ",
  "DE",
  "DK",
  "ES",
  "FI",
  "FR",
  "GB",
  "HU",
  "IE",
  "IT",
  "LI",
  "LU",
  "NL",
  "NO",
  "PL",
  "PT",
  "RO",
  "SE",
  "SK",
  "US",
] as const;

type VariantLookupRow = {
  id: string;
  size_label: string;
  format: PrintFormat;
  price_cents: number;
  in_stock: boolean;
  available_on_request: boolean;
  prints: { slug?: string } | { slug?: string }[] | null;
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  // Validate payload shape.
  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray((body as Record<string, unknown>).lineItems)
  ) {
    return NextResponse.json(
      { error: "Invalid payload: lineItems array required." },
      { status: 400 }
    );
  }

  const payload = body as CheckoutPayload;
  const { lineItems } = payload;

  if (lineItems.length === 0) {
    return NextResponse.json(
      { error: "Cart is empty — at least one line item required." },
      { status: 400 }
    );
  }

  // Validate each line item.
  for (const item of lineItems) {
    if (
      !item.variantId ||
      typeof item.variantId !== "string" ||
      typeof item.quantity !== "number" ||
      item.quantity < 1 ||
      !Number.isInteger(item.quantity) ||
      typeof item.priceInCents !== "number" ||
      item.priceInCents < 1 ||
      !Number.isInteger(item.priceInCents)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid line item: each item must have a variantId string, a positive integer quantity, and a positive integer priceInCents.",
        },
        { status: 400 }
      );
    }
  }

  const sessionId =
    typeof payload.sessionId === "string" ? payload.sessionId.trim() : "";
  const source = typeof payload.source === "string" ? payload.source.trim() : "";

  if (
    (sessionId && sessionId.length > 120) ||
    (source && source.length > 120)
  ) {
    return NextResponse.json(
      { error: "Invalid analytics metadata." },
      { status: 400 }
    );
  }

  const origin =
    request.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  try {
    const db = getServiceClient();
    const variantIds = [...new Set(lineItems.map((item) => item.variantId))];
    const { data: variantRows, error: variantLookupError } = await db
      .from("print_variants")
      .select(
        "id, size_label, format, price_cents, in_stock, available_on_request, prints!inner(slug)"
      )
      .in("id", variantIds);

    if (variantLookupError) {
      throw new Error(`Variant lookup failed: ${variantLookupError.message}`);
    }

    const variantsById = new Map(
      ((variantRows ?? []) as VariantLookupRow[]).map((variant) => [
        variant.id,
        variant,
      ])
    );
    const stripeLineItems = [];

    for (const item of lineItems) {
      const variant = variantsById.get(item.variantId);

      if (!variant) {
        return NextResponse.json(
          { error: `Unknown variant: ${item.variantId}.` },
          { status: 400 }
        );
      }

      if (!variant.in_stock || variant.available_on_request) {
        return NextResponse.json(
          { error: `Variant ${item.variantId} is not available for checkout.` },
          { status: 400 }
        );
      }

      const printRecord = Array.isArray(variant.prints)
        ? variant.prints[0]
        : variant.prints;
      const printSlug = printRecord?.slug;

      if (!printSlug) {
        throw new Error(`Print slug missing for variant ${item.variantId}.`);
      }

      const priceId = getStripePriceId(
        printSlug,
        variant.size_label,
        variant.format
      );

      if (!priceId) {
        captureHandledException(
          `Missing Stripe Price ID for ${printSlug} ${variant.size_label} ${variant.format}.`,
          {
            surface: "api.checkout",
            statusCode: 500,
            extras: {
              variant_id: item.variantId,
              print_slug: printSlug,
              size_label: variant.size_label,
              format: variant.format,
            },
          }
        );
        return NextResponse.json(
          { error: `Missing Stripe Price ID for variant ${item.variantId}.` },
          { status: 500 }
        );
      }

      stripeLineItems.push({
        price: priceId,
        quantity: item.quantity,
      });
    }

    const stripe = getStripe();
    const metadata: Record<string, string> = {};
    if (sessionId) {
      metadata.analytics_session_id = sessionId;
    }
    if (source) {
      metadata.analytics_source = source;
    }
    metadata.cart_items = JSON.stringify(
      lineItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }))
    );

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: stripeLineItems,
      shipping_address_collection: {
        allowed_countries: [...ALLOWED_COUNTRIES],
      },
      metadata,
      success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    if (!session.url) {
      captureHandledException("Stripe did not return a checkout URL.", {
        surface: "api.checkout",
        statusCode: 500,
        extras: {
          line_item_count: lineItems.length,
          session_id: sessionId || null,
          source: source || null,
        },
      });
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe session creation failed.";
    captureHandledException(err, {
      surface: "api.checkout",
      statusCode: 500,
      extras: {
        line_item_count: lineItems.length,
        session_id: sessionId || null,
        source: source || null,
      },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
