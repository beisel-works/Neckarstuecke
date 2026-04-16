import { NextRequest, NextResponse } from "next/server";
import { captureHandledException } from "@/lib/sentry";
import { getServiceClient } from "@/lib/supabase/service";
import type { FulfilmentStatus } from "@/types/order";

interface ProdigiShipment {
  carrier?: {
    name?: string | null;
  } | null;
  tracking?: {
    number?: string | null;
  } | null;
}

interface ProdigiOrderData {
  id?: string;
  status?: {
    stage?: string;
  };
  shipments?: ProdigiShipment[] | null;
}

interface ProdigiWebhookPayload {
  type?: string;
  subject?: string;
  data?: ProdigiOrderData | { order?: ProdigiOrderData } | null;
  order?: ProdigiOrderData;
  shipment?: ProdigiShipment | null;
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
      return "shipped";
    case "cancelled":
    case "canceled":
    case "failed":
      return "failed";
    default:
      return null;
  }
}

function getProdigiOrderData(
  payload: ProdigiWebhookPayload
): ProdigiOrderData | null {
  if (payload.data && typeof payload.data === "object") {
    if ("order" in payload.data && payload.data.order) {
      return payload.data.order;
    }

    return payload.data as ProdigiOrderData;
  }

  return payload.order ?? null;
}

function getProdigiShipment(
  payload: ProdigiWebhookPayload,
  order: ProdigiOrderData | null
): ProdigiShipment | null {
  if (payload.shipment) {
    return payload.shipment;
  }

  return order?.shipments?.[0] ?? null;
}

export function buildProdigiOrderUpdate(
  payload: ProdigiWebhookPayload
): ProdigiOrderUpdate | null {
  const order = getProdigiOrderData(payload);
  const supplierOrderId = order?.id ?? payload.subject;
  if (!supplierOrderId) {
    return null;
  }

  const eventType = payload.type?.trim();
  const normalizedType = eventType?.toLowerCase() ?? "";
  const shipment = getProdigiShipment(payload, order);

  if (normalizedType.includes("shipment")) {
    return {
      supplierOrderId,
      status: "shipped",
      tracking_number: shipment?.tracking?.number ?? null,
      carrier: shipment?.carrier?.name ?? null,
    };
  }

  if (normalizedType.includes("status.stage.changed")) {
    const fragmentStage = eventType?.split("#")[1] ?? null;
    const status = mapProdigiStageToStatus(fragmentStage ?? order?.status?.stage);
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
    captureHandledException(error.message, {
      surface: "api.webhooks.prodigi",
      statusCode: 500,
      extras: {
        supplier_order_id: update.supplierOrderId,
        payload_type: payload.type ?? null,
      },
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!order) {
    captureHandledException("No order found for supplier_order_id.", {
      surface: "api.webhooks.prodigi",
      statusCode: 500,
      extras: {
        supplier_order_id: update.supplierOrderId,
        payload_type: payload.type ?? null,
      },
    });
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
    captureHandledException(updateError.message, {
      surface: "api.webhooks.prodigi",
      statusCode: 500,
      extras: {
        order_id: order.id,
        supplier_order_id: update.supplierOrderId,
        next_status: patch.status ?? null,
      },
    });
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
