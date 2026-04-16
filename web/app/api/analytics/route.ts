import { NextRequest, NextResponse } from "next/server";
import { parseAnalyticsPayload } from "@/lib/analytics/shared";
import { captureHandledException } from "@/lib/sentry";
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

  const payload = parseAnalyticsPayload(body);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid analytics payload." },
      { status: 400 }
    );
  }

  try {
    const db = getServiceClient();
    const { error } = await db.from("analytics_events").insert({
      event_name: payload.event,
      page: payload.page,
      motif_slug: payload.motifSlug ?? null,
      session_id: payload.sessionId,
      metadata: payload.metadata ?? {},
    });

    if (error) {
      captureHandledException(error.message, {
        surface: "api.analytics",
        statusCode: 500,
        extras: {
          event_name: payload.event,
          page: payload.page,
          motif_slug: payload.motifSlug ?? null,
          session_id: payload.sessionId,
        },
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } catch (error) {
    captureHandledException(error, {
      surface: "api.analytics",
      statusCode: 202,
      extras: {
        event_name: payload.event,
        page: payload.page,
        motif_slug: payload.motifSlug ?? null,
        session_id: payload.sessionId,
      },
    });
    return NextResponse.json({ accepted: true }, { status: 202 });
  }

  return NextResponse.json({ ok: true });
}
