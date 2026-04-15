import { SpanStatusCode, trace } from "@opentelemetry/api";
import { NextResponse } from "next/server";

const tracer = trace.getTracer("neckarstuecke.observability");

export function GET(): NextResponse {
  return tracer.startActiveSpan("observability.healthcheck", (span) => {
    span.setAttribute("deployment.environment.name", process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development");
    span.setAttribute("service.name", "neckarstuecke");
    span.setAttribute("verification.route", "/api/health/observability");
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return NextResponse.json({ ok: true });
  });
}
