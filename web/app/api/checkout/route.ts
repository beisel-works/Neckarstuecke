import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import type { CheckoutPayload } from "@/types/cart";

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
    const stripe = getStripe();
    const metadata: Record<string, string> = {};
    if (sessionId) {
      metadata.analytics_session_id = sessionId;
    }
    if (source) {
      metadata.analytics_source = source;
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems.map((item) => ({
        price_data: {
          currency: "eur",
          unit_amount: item.priceInCents,
          product_data: {
            name: item.variantId, // variant ID as fallback; BEI-22 may enrich this
          },
        },
        quantity: item.quantity,
      })),
      shipping_address_collection: {
        allowed_countries: [...ALLOWED_COUNTRIES],
      },
      metadata,
      success_url: `${origin}/order/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Stripe session creation failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
