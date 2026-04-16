import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { tasks } from "@trigger.dev/sdk/v3";
import { normalizeSessionId } from "@/lib/analytics/shared";
import { captureHandledException } from "@/lib/sentry";
import { getStripe } from "@/lib/stripe";
import { getServiceClient } from "@/lib/supabase/service";

// ---------------------------------------------------------------------------
// Stripe webhook handler: POST /api/webhooks/stripe
//
// Security: validates the Stripe-Signature header before processing any data.
// Idempotency: checks for an existing order by stripe_session_id before inserting.
// Reliability: returns 200 immediately after successful processing to prevent Stripe retries.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // 1. Read raw body — required for Stripe signature verification.
  //    Parsing the body as JSON first would break the HMAC check.
  const rawBody = await request.text();

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    captureHandledException("Webhook secret not configured.", {
      surface: "api.webhooks.stripe",
      statusCode: 500,
      extras: {
        event_type: "checkout.session.completed",
      },
    });
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 500 });
  }

  // 2. Verify the event — rejects tampered or forged requests with a 400.
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Signature verification failed.";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  // 3. Route on event type — ignore events we don't handle.
  if (event.type === "checkout.session.completed") {
    try {
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Order persistence failed.";
      captureHandledException(err, {
        surface: "api.webhooks.stripe",
        statusCode: 500,
        extras: {
          event_type: event.type,
          stripe_session_id:
            typeof event.data.object?.id === "string" ? event.data.object.id : null,
        },
      });
      console.error("Webhook order persistence error:", message);
      // Return 500 so Stripe will retry. Do NOT return 200 on write failure.
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  // 4. Acknowledge receipt — 200 prevents unnecessary Stripe retries for handled events.
  return NextResponse.json({ received: true });
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
): Promise<void> {
  const sessionId = session.id;
  const fulfillmentIdempotencyKey = ["fulfill-order", sessionId];

  // 5. Retrieve the full session with line_items expanded.
  const fullSession = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["line_items"],
  });

  const db = getServiceClient();

  // 6. Idempotency check — skip insert if this session was already processed.
  const { data: existing, error: lookupError } = await db
    .from("orders")
    .select("id")
    .eq("stripe_session_id", sessionId)
    .maybeSingle();

  if (lookupError) {
    throw new Error(`Supabase lookup failed: ${lookupError.message}`);
  }
  if (existing) {
    await recordPurchaseCompleteEvent(db, fullSession);
    await tasks.trigger(
      "fulfill-order",
      { orderId: existing.id },
      { idempotencyKey: fulfillmentIdempotencyKey }
    );
    return;
  }

  // 7. Build the order record.
  const lineItems = (fullSession.line_items?.data ?? []).map((item) => ({
    description: item.description ?? "",
    quantity: item.quantity ?? 1,
    amount_total: item.amount_total ?? 0,
    currency: item.currency ?? "eur",
  }));

  const shippingAddress = fullSession.collected_information?.shipping_details?.address ?? null;
  const customerEmail =
    fullSession.customer_details?.email ?? fullSession.customer_email ?? null;

  const record = {
    stripe_session_id: sessionId,
    stripe_payment_intent_id:
      typeof fullSession.payment_intent === "string"
        ? fullSession.payment_intent
        : (fullSession.payment_intent?.id ?? null),
    status: "paid" as const,
    customer_email: customerEmail,
    shipping_address: shippingAddress,
    line_items: lineItems,
    total_cents: fullSession.amount_total ?? null,
    currency: fullSession.currency ?? "eur",
  };

  // 8. Insert the order — service role bypasses RLS.
  const { data: insertedOrder, error: insertError } = await db
    .from("orders")
    .insert(record)
    .select("id")
    .single();

  if (insertError) {
    throw new Error(`Supabase insert failed: ${insertError.message}`);
  }

  await recordPurchaseCompleteEvent(db, fullSession);

  await tasks.trigger(
    "fulfill-order",
    { orderId: insertedOrder.id },
    { idempotencyKey: fulfillmentIdempotencyKey }
  );
}

async function recordPurchaseCompleteEvent(
  db: ReturnType<typeof getServiceClient>,
  session: Stripe.Checkout.Session
): Promise<void> {
  const analyticsSessionId =
    normalizeSessionId(session.metadata?.analytics_session_id) ?? session.id;
  const analyticsSource =
    typeof session.metadata?.analytics_source === "string" &&
    session.metadata.analytics_source.trim()
      ? session.metadata.analytics_source.trim().slice(0, 120)
      : null;
  const lineItemCount = session.line_items?.data.length ?? 0;

  const { error } = await db.from("analytics_events").insert({
    event_name: "purchase_complete",
    page: "/order/confirmation",
    session_id: analyticsSessionId,
    idempotency_key: `purchase_complete:${session.id}`,
    metadata: {
      item_count: lineItemCount,
      total_cents: session.amount_total ?? 0,
      source: analyticsSource,
      stripe_session_id: session.id,
    },
  });

  if (error && error.code !== "23505") {
    throw new Error(`Analytics insert failed: ${error.message}`);
  }
}
