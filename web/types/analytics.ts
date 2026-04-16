export type AnalyticsEventName =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "checkout_started"
  | "purchase_complete"
  | "inquiry_submitted"
  | "feedback_submitted";

export interface AnalyticsPayload {
  event: AnalyticsEventName;
  page: string;
  motifSlug?: string | null;
  sessionId: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface FeedbackPayload {
  sessionId: string;
  page: string;
  orderReference?: string | null;
  email?: string | null;
  resonanceRating: number;
  message?: string;
}
