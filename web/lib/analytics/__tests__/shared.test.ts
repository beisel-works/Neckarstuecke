import { describe, expect, it } from "vitest";
import {
  parseAnalyticsPayload,
  parseFeedbackPayload,
} from "@/lib/analytics/shared";

describe("parseAnalyticsPayload", () => {
  it("accepts a valid analytics payload", () => {
    expect(
      parseAnalyticsPayload({
        event: "product_view",
        page: "/prints/minneburg",
        motifSlug: "minneburg",
        sessionId: "session-123",
        metadata: { source: "detail-page", quantity: 1 },
      })
    ).toEqual({
      event: "product_view",
      page: "/prints/minneburg",
      motifSlug: "minneburg",
      sessionId: "session-123",
      metadata: { source: "detail-page", quantity: 1 },
    });
  });

  it("rejects an invalid page path", () => {
    expect(
      parseAnalyticsPayload({
        event: "page_view",
        page: "prints/minneburg",
        sessionId: "session-123",
      })
    ).toBeNull();
  });
});

describe("parseFeedbackPayload", () => {
  it("accepts a valid feedback payload", () => {
    expect(
      parseFeedbackPayload({
        sessionId: "session-123",
        page: "/order/confirmation",
        resonanceRating: 5,
        message: "Sehr berührend.",
        orderReference: "cs_test_123",
        email: "kunde@example.com",
      })
    ).toEqual({
      sessionId: "session-123",
      page: "/order/confirmation",
      resonanceRating: 5,
      message: "Sehr berührend.",
      orderReference: "cs_test_123",
      email: "kunde@example.com",
    });
  });

  it("rejects invalid ratings", () => {
    expect(
      parseFeedbackPayload({
        sessionId: "session-123",
        page: "/order/confirmation",
        resonanceRating: 7,
      })
    ).toBeNull();
  });

  it("rejects invalid email addresses", () => {
    expect(
      parseFeedbackPayload({
        sessionId: "session-123",
        page: "/order/confirmation",
        resonanceRating: 5,
        email: "kein-email-format",
      })
    ).toBeNull();
  });
});
