"use client";

import { useState } from "react";
import { submitFeedback, trackEvent } from "@/lib/analytics/client";
import { captureHandledException } from "@/lib/sentry";

interface FeedbackFormProps {
  page: string;
  orderReference?: string | null;
}

const RATING_LABELS = [
  "Kaum",
  "Eher wenig",
  "Spürbar",
  "Stark",
  "Sehr stark",
] as const;

export default function FeedbackForm({
  page,
  orderReference,
}: FeedbackFormProps) {
  const [rating, setRating] = useState<number>(4);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");

    try {
      const response = await submitFeedback({
        page,
        orderReference,
        email: email || undefined,
        resonanceRating: rating,
        message,
      });

      if (!response.ok) {
        throw new Error("Feedback request failed.");
      }

      trackEvent({
        event: "feedback_submitted",
        page,
        metadata: { resonance_rating: rating },
      });

      setState("done");
      setEmail("");
      setMessage("");
    } catch (error) {
      captureHandledException(error, {
        surface: "ui.feedback",
        statusCode: "client_error",
        extras: {
          page,
          order_reference: orderReference ?? null,
          resonance_rating: rating,
        },
      });
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label
          htmlFor="resonance-rating"
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          Wie stark hat Sie das Motiv emotional angesprochen?
        </label>
        <select
          id="resonance-rating"
          value={rating}
          onChange={(event) => setRating(Number(event.target.value))}
          className="border border-[var(--color-loess)] bg-[var(--color-paper)] px-4 py-3 text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
          }}
        >
          {RATING_LABELS.map((label, index) => (
            <option key={label} value={index + 1}>
              {index + 1} - {label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="feedback-email"
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          E-Mail für eine mögliche Rückfrage (optional)
        </label>
        <input
          id="feedback-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          maxLength={320}
          className="border border-[var(--color-loess)] bg-[var(--color-paper)] px-4 py-3 text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
          }}
        />
        <p
          className="text-[var(--color-stone)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-caption)",
            lineHeight: "var(--leading-body)",
          }}
        >
          Wenn Sie eine E-Mail angeben, verwenden wir sie ausschließlich für
          eine Rückfrage zu Ihrem Feedback.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="feedback-message"
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          Was hat Sie an Ihrem Druck angesprochen?
        </label>
        <textarea
          id="feedback-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          maxLength={2000}
          className="border border-[var(--color-loess)] bg-[var(--color-paper)] px-4 py-3 text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-body)",
          }}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={state === "sending" || state === "done"}
          className="border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-6 py-3 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-sage)] hover:border-[var(--color-sage)] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          {state === "done" ? "Danke" : state === "sending" ? "Senden..." : "Feedback senden"}
        </button>

        {state === "error" && (
          <p
            className="text-[var(--color-ochre)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-caption)",
            }}
          >
            Feedback konnte gerade nicht gespeichert werden.
          </p>
        )}
      </div>
    </form>
  );
}
