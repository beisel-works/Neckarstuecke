import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase/service";
import type { FulfilmentStatus } from "@/types/order";

interface ProdigiWebhookPayload {
  event?: string;
  type?: string;
  order?: {
    id?: string;
    status?: {
      stage?: string;
    };
  };
  shipment?: {
    carrier?: {
      name?: string | null;
    };
    tracking?: {
      number?: string | null;
    };
  };
}

interface ProdigiOrderUpdate {
  supplierOrderId: string;
  status?: FulfilmentStatus;
  tracking_number?: string | null;
  carrier?: string | null;
}

const STATUS_RANK: Record<FulfilmentStatus, number> = {
  paid: 0,
  submitted: 1,
  in_production: 2,
  shipped: 3,
  delivered: 4,
  failed: 5,
};

function signaturesMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

export function verifyProdigiSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const normalizedSignature = signature.trim().replace(/^sha256=/i, "");
  const digest = createHmac("sha256", secret).update(rawBody).digest();

  return (
    signaturesMatch(digest.toString("hex"), normalizedSignature) ||
    signaturesMatch(digest.toString("base64"), normalizedSignature)
  );
}

export function mapProdigiStageToStatus(
  stage?: string | null
): FulfilmentStatus | null {
  switch (stage?.trim().toLowerCase()) {
    case "inprogress":
    case "in_progress":
    case "processing":
      return "in_production";
    case "complete":
    case "completed":
    case "delivered":
      return "delivered";
    case "cancelled":
    case "canceled":
    case "failed":
      return "failed";
    default:
      return null;
  }
}

export function buildProdigiOrderUpdate(
  payload: ProdigiWebhookPayload
): ProdigiOrderUpdate | null {
  const supplierOrderId = payload.order?.id;
  if (!supplierOrderId) {
    return null;
  }

  const eventType = payload.event ?? payload.type;

  if (eventType === "shipment.complete") {
    return {
      supplierOrderId,
      status: "shipped",
      tracking_number: payload.shipment?.tracking?.number ?? null,
      carrier: payload.shipment?.carrier?.name ?? null,
    };
  }

  if (eventType === "order.outcome.complete") {
    return {
      supplierOrderId,
      status: "delivered",
    };
  }

  if (eventType === "order.status.changed") {
    const status = mapProdigiStageToStatus(payload.order?.status?.stage);
    if (!status) {
      return null;
    }

    return {
      supplierOrderId,
      status,
    };
  }

  return null;
}

export function shouldAdvanceOrderStatus(
  currentStatus: FulfilmentStatus | null | undefined,
  nextStatus: FulfilmentStatus | null | undefined
): boolean {
  if (!nextStatus) {
    return false;
  }

  if (!currentStatus) {
    return true;
  }

  if (currentStatus === nextStatus) {
    return false;
  }

  if (currentStatus === "delivered") {
    return false;
  }

  if (nextStatus === "failed") {
    return currentStatus !== "shipped";
  }

  if (currentStatus === "failed") {
    return true;
  }

  return STATUS_RANK[nextStatus] > STATUS_RANK[currentStatus];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const rawBody = await request.text();
  const signature = request.headers.get("x-prodigi-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing x-prodigi-signature header." },
      { status: 400 }
    );
  }

  const secret = process.env.PRODIGI_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  if (!verifyProdigiSignature(rawBody, signature, secret)) {
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 401 }
    );
  }

  let payload: ProdigiWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as ProdigiWebhookPayload;
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const update = buildProdigiOrderUpdate(payload);
  if (!update) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const db = getServiceClient();
  const { data: order, error } = await db
    .from("orders")
    .select("id, status, tracking_number, carrier")
    .eq("supplier_order_id", update.supplierOrderId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!order) {
    return NextResponse.json(
      { error: "No order found for supplier_order_id." },
      { status: 500 }
    );
  }

  const patch: {
    status?: FulfilmentStatus;
    tracking_number?: string | null;
    carrier?: string | null;
  } = {};

  if (update.status && shouldAdvanceOrderStatus(order.status, update.status)) {
    patch.status = update.status;
  }

  if (
    "tracking_number" in update &&
    update.tracking_number &&
    update.tracking_number !== order.tracking_number
  ) {
    patch.tracking_number = update.tracking_number;
  }

  if ("carrier" in update && update.carrier && update.carrier !== order.carrier) {
    patch.carrier = update.carrier;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ received: true, ignored: true });
  }

  const { error: updateError } = await db
    .from("orders")
    .update(patch)
    .eq("id", order.id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
