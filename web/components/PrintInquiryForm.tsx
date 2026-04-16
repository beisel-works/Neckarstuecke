"use client";

import { useState } from "react";
import {
  getAnalyticsSessionId,
  trackEvent,
} from "@/lib/analytics/client";
import { captureHandledException } from "@/lib/sentry";

interface PrintInquiryFormProps {
  printTitle: string;
  printSlug: string;
}

const VARIANT_LABEL = "70×100 cm Gerahmt";
const PRICE_HINT = "~529–549 €";

export default function PrintInquiryForm({
  printTitle,
  printSlug,
}: PrintInquiryFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    "idle"
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          delivery_country: country,
          message,
          print_slug: printSlug,
          variant_label: VARIANT_LABEL,
          price_hint: PRICE_HINT,
          session_id: getAnalyticsSessionId(),
        }),
      });

      if (!response.ok) {
        throw new Error("Inquiry request failed.");
      }

      trackEvent({
        event: "inquiry_submitted",
        page: `/prints/${printSlug}`,
        motifSlug: printSlug,
        metadata: {
          variant_label: VARIANT_LABEL,
        },
      });

      setStatus("success");
    } catch (error) {
      captureHandledException(error, {
        surface: "ui.print_inquiry",
        statusCode: "client_error",
        extras: {
          print_slug: printSlug,
          variant_label: VARIANT_LABEL,
        },
      });
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border border-[var(--color-loess)] bg-[var(--color-paper)] p-6">
        <p
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h4)",
            lineHeight: "var(--leading-h4)",
          }}
        >
          Anfrage eingegangen.
        </p>
        <p
          className="mt-3 text-[var(--color-stone)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-body)",
          }}
        >
          Wir melden uns mit einer individuellen Kalkulation für {printTitle} in{" "}
          {VARIANT_LABEL}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-[var(--color-loess)] bg-[var(--color-paper)] p-6">
      <div className="flex flex-col gap-1">
        <p
          className="uppercase text-[var(--color-stone)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-overline)",
            letterSpacing: "var(--tracking-overline)",
          }}
        >
          Anfrage
        </p>
        <p
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h4)",
            lineHeight: "var(--leading-h4)",
          }}
        >
          {printTitle}
        </p>
        <p
          className="text-[var(--color-stone)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
            lineHeight: "var(--leading-body)",
          }}
        >
          {VARIANT_LABEL} · {PRICE_HINT}
        </p>
      </div>

      <label className="flex flex-col gap-2">
        <span
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          Name
        </span>
        <input
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="border border-[var(--color-loess)] bg-[var(--color-paper)] px-4 py-3 text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
          }}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          E-Mail
        </span>
        <input
          required
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="border border-[var(--color-loess)] bg-[var(--color-paper)] px-4 py-3 text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
          }}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          Lieferland
        </span>
        <input
          required
          value={country}
          onChange={(event) => setCountry(event.target.value)}
          className="border border-[var(--color-loess)] bg-[var(--color-paper)] px-4 py-3 text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-body)",
          }}
        />
      </label>

      <label className="flex flex-col gap-2">
        <span
          className="text-[var(--color-charcoal)]"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          Nachricht (optional)
        </span>
        <textarea
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
      </label>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "submitting" || !name || !email || !country}
          className="border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-6 py-3 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-sage)] hover:border-[var(--color-sage)] disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "var(--text-label)",
            letterSpacing: "var(--tracking-label)",
            fontWeight: 500,
          }}
        >
          {status === "submitting" ? "Senden..." : "Anfrage absenden"}
        </button>

        {status === "error" && (
          <p
            className="text-[var(--color-ochre)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-caption)",
            }}
          >
            Anfrage konnte gerade nicht gespeichert werden.
          </p>
        )}
      </div>
    </form>
  );
}
