import { NextRequest, NextResponse } from "next/server";
import { parseFeedbackPayload } from "@/lib/analytics/shared";
import { getServiceClient } from "@/lib/supabase/service";

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

  const payload = parseFeedbackPayload(body);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid feedback payload." },
      { status: 400 }
    );
  }

  try {
    const db = getServiceClient();
    const { error } = await db.from("customer_feedback").insert({
      session_id: payload.sessionId,
      page: payload.page,
      order_reference: payload.orderReference ?? null,
      email: payload.email ?? null,
      resonance_rating: payload.resonanceRating,
      message: payload.message ?? "",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ accepted: true }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}
