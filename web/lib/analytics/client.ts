"use client";

import type {
  AnalyticsEventName,
  FeedbackPayload,
} from "@/types/analytics";

const STORAGE_KEY = "neckarstuecke_analytics_session_v1";
const SOURCE_STORAGE_KEY = "neckarstuecke_analytics_source_v1";

function normalizeTrackingValue(value: string | null): string | null {
  if (!value) return null;
  const normalized = value.trim();
  if (!normalized) return null;
  return normalized.slice(0, 120);
}

export function getAnalyticsSessionId(): string {
  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const sessionId = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, sessionId);
  return sessionId;
}

export function getAnalyticsSource(): string | null {
  const existing = normalizeTrackingValue(
    window.sessionStorage.getItem(SOURCE_STORAGE_KEY)
  );
  if (existing) return existing;

  const source = normalizeTrackingValue(
    new URLSearchParams(window.location.search).get("utm_source")
  );
  if (!source) return null;

  window.sessionStorage.setItem(SOURCE_STORAGE_KEY, source);
  return source;
}

export function trackEvent(args: {
  event: AnalyticsEventName;
  page: string;
  motifSlug?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}): void {
  const metadata = { ...(args.metadata ?? {}) };
  const source = getAnalyticsSource();
  if (source && metadata.source === undefined) {
    metadata.source = source;
  }

  const payload = JSON.stringify({
    ...args,
    metadata,
    sessionId: getAnalyticsSessionId(),
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "/api/analytics",
      new Blob([payload], { type: "application/json" })
    );
    return;
  }

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  });
}

export async function submitFeedback(
  payload: Omit<FeedbackPayload, "sessionId">
): Promise<Response> {
  return fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      sessionId: getAnalyticsSessionId(),
    }),
  });
}
