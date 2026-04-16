import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = process.env.SENTRY_SMOKE_TOKEN;
  const authorization = request.headers.get("authorization");

  if (!token || authorization !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const eventId = Sentry.withScope((scope) => {
    scope.setTag("handled", "true");
    scope.setTag("surface", "health.sentry");
    scope.setTag("status_code", "smoke");
    scope.setTag("smoke", "true");
    return Sentry.captureException(new Error("Sentry smoke test"));
  });

  await Sentry.flush(2000);

  return NextResponse.json({ ok: true, eventId });
}
