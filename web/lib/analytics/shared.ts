import type {
  AnalyticsEventName,
  AnalyticsPayload,
  FeedbackPayload,
} from "@/types/analytics";

const ANALYTICS_EVENTS: AnalyticsEventName[] = [
  "page_view",
  "product_view",
  "add_to_cart",
  "checkout_started",
  "purchase_complete",
  "inquiry_submitted",
  "feedback_submitted",
];

export function isAnalyticsEventName(value: string): value is AnalyticsEventName {
  return ANALYTICS_EVENTS.includes(value as AnalyticsEventName);
}

export function normalizePath(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const path = value.trim();
  if (!path || !path.startsWith("/")) return null;
  return path.slice(0, 200);
}

export function normalizeSessionId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const sessionId = value.trim();
  if (!sessionId || sessionId.length > 120) return null;
  return sessionId;
}

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  if (!email || email.length > 320 || !email.includes("@")) return null;
  return email;
}

export function normalizeMotifSlug(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim();
  if (!slug) return null;
  return slug.slice(0, 120);
}

export function sanitizeMetadata(
  value: unknown
): Record<string, string | number | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, string | number | boolean | null>
  >((metadata, [key, field]) => {
    if (
      key.length <= 80 &&
      (typeof field === "string" ||
        typeof field === "number" ||
        typeof field === "boolean" ||
        field === null)
    ) {
      metadata[key] = field;
    }

    return metadata;
  }, {});
}

export function parseAnalyticsPayload(body: unknown): AnalyticsPayload | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  if (typeof record.event !== "string" || !isAnalyticsEventName(record.event)) {
    return null;
  }

  const page = normalizePath(record.page);
  const sessionId = normalizeSessionId(record.sessionId);
  if (!page || !sessionId) return null;

  return {
    event: record.event,
    page,
    sessionId,
    motifSlug: normalizeMotifSlug(record.motifSlug),
    metadata: sanitizeMetadata(record.metadata),
  };
}

export function parseFeedbackPayload(body: unknown): FeedbackPayload | null {
  if (!body || typeof body !== "object") return null;

  const record = body as Record<string, unknown>;
  const sessionId = normalizeSessionId(record.sessionId);
  const page = normalizePath(record.page);
  const resonanceRating = record.resonanceRating;
  const message =
    typeof record.message === "string" ? record.message.trim().slice(0, 2000) : "";
  const orderReference =
    typeof record.orderReference === "string"
      ? record.orderReference.trim().slice(0, 200)
      : null;
  const email =
    record.email === undefined || record.email === null || record.email === ""
      ? null
      : normalizeEmail(record.email);

  if (
    !sessionId ||
    !page ||
    (record.email !== undefined && record.email !== null && record.email !== "" && !email) ||
    typeof resonanceRating !== "number" ||
    !Number.isInteger(resonanceRating) ||
    resonanceRating < 1 ||
    resonanceRating > 5
  ) {
    return null;
  }

  return {
    sessionId,
    page,
    orderReference,
    email,
    resonanceRating,
    message,
  };
}
