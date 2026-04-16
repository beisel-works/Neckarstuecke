import type { Metadata } from "next";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { captureHandledException } from "@/lib/sentry";
import type Stripe from "stripe";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Bestellung bestätigt – Neckarstücke",
  description: "Ihre Bestellung bei Neckarstücke wurde erfolgreich aufgegeben.",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Format cents as "89,00 €" (German locale). */
export function formatCents(cents: number): string {
  return (
    new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100)
  );
}

type SessionResult =
  | { ok: true; session: Stripe.Checkout.Session }
  | { ok: false; reason: "missing_id" | "invalid_session" | "not_paid" | "stripe_error" };

async function retrieveSession(sessionId: string): Promise<SessionResult> {
  if (!sessionId.trim()) {
    return { ok: false, reason: "missing_id" };
  }

  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return { ok: false, reason: "not_paid" };
    }

    return { ok: true, session };
  } catch (err) {
    // Stripe throws on invalid session IDs (no such checkout.session)
    if (
      err instanceof Error &&
      err.message.toLowerCase().includes("no such")
    ) {
      return { ok: false, reason: "invalid_session" };
    }
    captureHandledException(err, {
      surface: "page.order_confirmation",
      statusCode: "stripe_error",
      extras: {
        stripe_session_id: sessionId,
      },
    });
    return { ok: false, reason: "stripe_error" };
  }
}

// ---------------------------------------------------------------------------
// Fallback UI
// ---------------------------------------------------------------------------

function FallbackPage({
  reason,
}: {
  reason: "missing_id" | "invalid_session" | "not_paid" | "stripe_error";
}) {
  const messages: Record<typeof reason, { heading: string; body: string }> = {
    missing_id: {
      heading: "Keine Bestellreferenz",
      body: "Es wurde keine gültige Bestellreferenz übergeben. Bitte öffnen Sie den Link aus Ihrer Bestätigungs-E-Mail oder kehren Sie zur Kollektion zurück.",
    },
    invalid_session: {
      heading: "Bestellung nicht gefunden",
      body: "Diese Bestellreferenz ist nicht bekannt. Möglicherweise ist der Link abgelaufen oder es handelt sich um einen Tippfehler. Prüfen Sie bitte Ihre Bestätigungs-E-Mail.",
    },
    not_paid: {
      heading: "Zahlung nicht abgeschlossen",
      body: "Für diese Bestellung ist noch keine erfolgreiche Zahlung eingegangen. Falls Sie soeben bezahlt haben, warten Sie einen Moment und laden Sie die Seite neu.",
    },
    stripe_error: {
      heading: "Bestellung vorübergehend nicht abrufbar",
      body: "Ihre Bestellung ist eingegangen, konnte aber gerade nicht abgerufen werden. Bitte prüfen Sie Ihre Bestätigungs-E-Mail oder kontaktieren Sie uns unter hallo@neckartuecke.de.",
    },
  };

  const { heading, body } = messages[reason];

  return (
    <div className="flex flex-col">
      <section className="px-6 pt-16 pb-10 md:px-10 md:pt-24 md:pb-14">
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
          <p
            className="mb-4 uppercase text-[var(--color-stone)]"
            style={{
              fontSize: "var(--text-overline)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Hinweis
          </p>
          <h1
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.75rem, 3.5vw, var(--text-h1))",
              lineHeight: "var(--leading-h1)",
              letterSpacing: "var(--tracking-h1)",
            }}
          >
            {heading}
          </h1>
        </div>
      </section>

      <div className="mx-6 h-px bg-[var(--color-loess)] md:mx-10" aria-hidden="true" />

      <section className="px-6 py-14 md:px-10 md:py-20">
        <div
          className="mx-auto flex flex-col gap-8"
          style={{ maxWidth: "var(--container-prose, 680px)" }}
        >
          <p
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-body)",
              lineHeight: "var(--leading-body)",
            }}
          >
            {body}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/kollektion"
              className="inline-block bg-[var(--color-charcoal)] text-[var(--color-paper)] px-8 py-3 hover:bg-[var(--color-sage)] transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-label)",
                letterSpacing: "0.08em",
              }}
            >
              Zur Kollektion
            </Link>
            <a
              href="mailto:hallo@neckartuecke.de"
              className="inline-block border border-[var(--color-charcoal)] text-[var(--color-charcoal)] px-8 py-3 hover:bg-[var(--color-loess)] transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-label)",
                letterSpacing: "0.08em",
              }}
            >
              Kontakt
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId) {
    return <FallbackPage reason="missing_id" />;
  }

  const result = await retrieveSession(sessionId);

  if (!result.ok) {
    return <FallbackPage reason={result.reason} />;
  }

  const { session } = result;
  const lineItems = session.line_items?.data ?? [];
  const customerEmail = session.customer_details?.email ?? null;
  const totalCents = session.amount_total ?? 0;

  return (
    <div className="flex flex-col">
      <AnalyticsTracker
        event="purchase_complete"
        page="/order/confirmation"
        metadata={{
          item_count: lineItems.length,
          total_cents: totalCents,
        }}
      />
      {/* ── Page header ───────────────────────────────────────────── */}
      <section className="px-6 pt-16 pb-10 md:px-10 md:pt-24 md:pb-14">
        <div className="mx-auto" style={{ maxWidth: "var(--container-content)" }}>
          <p
            className="mb-4 uppercase text-[var(--color-sage)]"
            style={{
              fontSize: "var(--text-overline)",
              fontFamily: "var(--font-sans)",
              letterSpacing: "var(--tracking-overline)",
            }}
          >
            Bestellung bestätigt
          </p>
          <h1
            className="text-[var(--color-charcoal)]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, var(--text-h1))",
              lineHeight: "var(--leading-h1)",
              letterSpacing: "var(--tracking-h1)",
            }}
          >
            Vielen Dank.
          </h1>
        </div>
      </section>

      <div className="mx-6 h-px bg-[var(--color-loess)] md:mx-10" aria-hidden="true" />

      {/* ── Confirmation body ─────────────────────────────────────── */}
      <section className="px-6 py-14 md:px-10 md:py-20">
        <div
          className="mx-auto flex flex-col gap-12"
          style={{ maxWidth: "var(--container-prose, 680px)" }}
        >
          {/* Lead message */}
          <div className="flex flex-col gap-4">
            <p
              className="text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Ihre Bestellung ist bei uns eingegangen und wird auf Bestellung
              für Sie produziert. Jeder Druck entsteht als Einzelstück auf
              Hahnemühle Fine Art Papier — signiert und nummeriert.
            </p>
            {customerEmail && (
              <p
                className="text-[var(--color-charcoal)]"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-body)",
                  lineHeight: "var(--leading-body)",
                }}
              >
                Eine Bestätigung wurde an{" "}
                <span
                  className="font-medium"
                  style={{ color: "var(--color-charcoal)" }}
                >
                  {customerEmail}
                </span>{" "}
                gesendet.
              </p>
            )}
          </div>

          {/* Order summary */}
          {lineItems.length > 0 && (
            <div>
              <h2
                className="mb-6 text-[var(--color-charcoal)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-h3)",
                  lineHeight: "var(--leading-h3)",
                  letterSpacing: "var(--tracking-h3)",
                }}
              >
                Ihre Bestellung
              </h2>

              <div className="flex flex-col divide-y divide-[var(--color-loess)]">
                {lineItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-6 py-4"
                  >
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-[var(--color-charcoal)]"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "var(--text-body)",
                          lineHeight: "var(--leading-body)",
                        }}
                      >
                        {item.description}
                      </span>
                      <span
                        className="text-[var(--color-stone)]"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "var(--text-caption)",
                        }}
                      >
                        Anzahl: {item.quantity ?? 1}
                      </span>
                    </div>
                    <span
                      className="whitespace-nowrap text-[var(--color-charcoal)]"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-body)",
                      }}
                    >
                      {item.amount_total != null
                        ? formatCents(item.amount_total)
                        : "—"}
                    </span>
                  </div>
                ))}

                {/* Total row */}
                <div className="flex items-center justify-between gap-6 py-4">
                  <span
                    className="font-medium text-[var(--color-charcoal)]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-body)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Gesamtbetrag
                  </span>
                  <span
                    className="font-medium text-[var(--color-charcoal)]"
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "var(--text-body)",
                    }}
                  >
                    {formatCents(totalCents)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Delivery expectations */}
          <div
            className="bg-[var(--color-loess)] px-8 py-8"
            style={{ borderLeft: "3px solid var(--color-sage)" }}
          >
            <h3
              className="mb-3 text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h4)",
                letterSpacing: "var(--tracking-h4)",
              }}
            >
              Was jetzt passiert
            </h3>
            <ul
              className="flex flex-col gap-3 text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              <li>
                Ihr Druck wird in den nächsten Werktagen produziert und
                sorgfältig verpackt.
              </li>
              <li>
                Die Lieferzeit beträgt in der Regel 7–14 Werktage nach
                Produktionsabschluss.
              </li>
              <li>
                Bei Fragen erreichen Sie uns jederzeit unter{" "}
                <a
                  href="mailto:hallo@neckartuecke.de"
                  className="text-[var(--color-sage)] hover:underline"
                >
                  hallo@neckartuecke.de
                </a>
                .
              </li>
            </ul>
          </div>

          <div
            className="border border-[var(--color-loess)] px-8 py-8"
          >
            <h3
              className="mb-3 text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--text-h4)",
              }}
            >
              Kurze Rückmeldung
            </h3>
            <p
              className="mb-5 text-[var(--color-charcoal)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
                lineHeight: "var(--leading-body)",
              }}
            >
              Ihre Antwort hilft uns zu verstehen, welche Motive wirklich Resonanz
              auslösen.
            </p>
            <FeedbackForm
              page="/order/confirmation"
              orderReference={session.id}
            />
          </div>

          {/* CTA back to collection */}
          <div>
            <Link
              href="/kollektion"
              className="inline-block border border-[var(--color-charcoal)] text-[var(--color-charcoal)] px-8 py-3 hover:bg-[var(--color-loess)] transition-colors"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-label)",
                letterSpacing: "0.08em",
              }}
            >
              Zur Kollektion
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
