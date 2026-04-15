"use client";

import { useEffect } from "react";
import type { AnalyticsEventName } from "@/types/analytics";
import { trackEvent } from "@/lib/analytics/client";

interface AnalyticsTrackerProps {
  event?: AnalyticsEventName;
  page: string;
  motifSlug?: string | null;
  metadata?: Record<string, string | number | boolean | null>;
}

export default function AnalyticsTracker({
  event = "page_view",
  page,
  motifSlug,
  metadata,
}: AnalyticsTrackerProps) {
  useEffect(() => {
    trackEvent({ event, page, motifSlug, metadata });
  }, [event, page, motifSlug, metadata]);

  return null;
}
