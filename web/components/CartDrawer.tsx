"use client";

import { useEffect, useRef, useState } from "react";
import { useCart } from "@/context/CartContext";
import { captureHandledException } from "@/lib/sentry";
import type { CheckoutPayload } from "@/types/cart";
import {
  getAnalyticsSessionId,
  getAnalyticsSource,
  trackEvent,
} from "@/lib/analytics/client";

/** Format a price in cents as a Euro string with thin NBSP before the symbol. */
function formatPrice(cents: number): string {
  return `${(cents / 100).toFixed(2).replace(".", ",")}\u202f€`;
}

function formatLabel(format: "print" | "framed"): string {
  return format === "framed" ? "Gerahmt" : "Print";
}

const CHECKOUT_CONFIGURATION_ERROR =
  /Missing STRIPE_SECRET_KEY|Missing Stripe Price ID|Stripe session creation failed/i;

const CHECKOUT_UNAVAILABLE_MESSAGE =
  "Checkout ist gerade nicht verfügbar. Bitte kontaktiere uns direkt für deine Bestellung.";

/**
 * Slide-over cart drawer — Client Component.
 * Renders a panel from the right with all cart line items, qty controls,
 * a running total, and a "Zur Kasse" CTA (interface contract for Stripe task).
 */
export default function CartDrawer() {
  const { items, totalCents, isOpen, closeCart, removeItem, updateQuantity } =
    useCart();
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Trap focus and close on Escape key.
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeCart();
    }
    document.addEventListener("keydown", onKeyDown);
    // Prevent body scroll while drawer is open.
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeCart]);

  useEffect(() => {
    if (!isOpen || items.length === 0) {
      setCheckoutError(null);
    }
  }, [isOpen, items.length]);

  async function handleCheckout() {
    setCheckoutError(null);
    const payload: CheckoutPayload = {
      lineItems: items.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
        priceInCents: item.priceInCents,
      })),
      sessionId: getAnalyticsSessionId(),
      source: getAnalyticsSource(),
    };
    trackEvent({
      event: "checkout_started",
      page: "/cart",
      metadata: {
        line_items: items.length,
        total_cents: totalCents,
      },
    });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        const message = data.error ?? `HTTP ${res.status}`;
        if (CHECKOUT_CONFIGURATION_ERROR.test(message)) {
          setCheckoutError(CHECKOUT_UNAVAILABLE_MESSAGE);
          return;
        }
        throw new Error(message);
      }
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (err) {
      setCheckoutError(
        "Checkout konnte gerade nicht gestartet werden. Bitte versuche es später erneut."
      );
      captureHandledException(err, {
        surface: "ui.checkout",
        statusCode: "client_error",
        extras: {
          line_item_count: items.length,
          total_cents: totalCents,
        },
      });
      console.error("[Checkout] failed:", err);
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      <div
        className="fixed inset-0 z-40 bg-[var(--color-charcoal)]/40"
        aria-hidden="true"
        onClick={closeCart}
      />

      {/* ── Drawer panel ──────────────────────────────────────── */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Warenkorb"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-[var(--color-paper)] shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-loess)] px-6 py-5">
          <h2
            className="text-[var(--color-charcoal)] uppercase"
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-label)",
              letterSpacing: "var(--tracking-label)",
              fontWeight: 500,
            }}
          >
            Warenkorb
          </h2>
          <button
            type="button"
            onClick={closeCart}
            aria-label="Warenkorb schließen"
            className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)] transition-colors"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="4" y1="4" x2="16" y2="16" />
              <line x1="16" y1="4" x2="4" y2="16" />
            </svg>
          </button>
        </div>

        {/* Line items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <p
              className="text-[var(--color-stone)] text-center mt-12"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-body)",
              }}
            >
              Dein Warenkorb ist leer.
            </p>
          ) : (
            <ul className="flex flex-col gap-6 list-none m-0 p-0">
              {items.map((item) => (
                <li
                  key={item.variantId}
                  className="flex gap-4 border-b border-[var(--color-loess)] pb-6 last:border-0 last:pb-0"
                >
                  {/* Thumbnail placeholder */}
                  <div
                    className="h-20 w-14 flex-shrink-0 bg-[var(--color-loess)] flex items-center justify-center overflow-hidden"
                    aria-hidden="true"
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span
                        className="text-[var(--color-stone)] text-center px-1 leading-tight"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "0.6rem",
                        }}
                      >
                        {item.title}
                      </span>
                    )}
                  </div>

                  {/* Item details */}
                  <div className="flex flex-1 flex-col gap-1">
                    <p
                      className="text-[var(--color-charcoal)] font-medium"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-label)",
                      }}
                    >
                      {item.title}
                    </p>
                    <p
                      className="text-[var(--color-stone)]"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-caption)",
                      }}
                    >
                      {item.sizeLabel} · {formatLabel(item.format)}
                    </p>
                    <p
                      className="text-[var(--color-charcoal)]"
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "var(--text-caption)",
                      }}
                    >
                      {formatPrice(item.priceInCents)}
                    </p>

                    {/* Quantity controls + remove */}
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center border border-[var(--color-loess)]">
                        <button
                          type="button"
                          aria-label={`${item.title} Menge verringern`}
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity - 1)
                          }
                          className="px-2 py-1 text-[var(--color-stone)] hover:text-[var(--color-charcoal)] transition-colors"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "var(--text-caption)",
                          }}
                        >
                          −
                        </button>
                        <span
                          className="px-3 py-1 text-[var(--color-charcoal)] tabular-nums"
                          aria-label={`Menge: ${item.quantity}`}
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "var(--text-caption)",
                          }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          aria-label={`${item.title} Menge erhöhen`}
                          onClick={() =>
                            updateQuantity(item.variantId, item.quantity + 1)
                          }
                          className="px-2 py-1 text-[var(--color-stone)] hover:text-[var(--color-charcoal)] transition-colors"
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "var(--text-caption)",
                          }}
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        aria-label={`${item.title} entfernen`}
                        className="text-[var(--color-stone)] hover:text-[var(--color-charcoal)] transition-colors underline underline-offset-2"
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "var(--text-caption)",
                        }}
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer — total + CTA */}
        {items.length > 0 && (
          <div className="border-t border-[var(--color-loess)] px-6 py-6 flex flex-col gap-4">
            <div className="flex items-baseline justify-between">
              <span
                className="text-[var(--color-charcoal)] uppercase"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-label)",
                  letterSpacing: "var(--tracking-label)",
                }}
              >
                Gesamt
              </span>
              <span
                className="text-[var(--color-charcoal)]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "var(--text-h3)",
                  lineHeight: "var(--leading-h3)",
                }}
                aria-live="polite"
              >
                {formatPrice(totalCents)}
              </span>
            </div>

            <p
              className="text-[var(--color-stone)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-caption)",
              }}
            >
              Inkl. MwSt. · zzgl. Versand
            </p>

            <button
              type="button"
              onClick={handleCheckout}
              className="w-full border border-[var(--color-charcoal)] bg-[var(--color-charcoal)] px-8 py-4 text-[var(--color-paper)] transition-colors hover:bg-[var(--color-sage)] hover:border-[var(--color-sage)]"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "var(--text-label)",
                letterSpacing: "var(--tracking-label)",
                fontWeight: 500,
              }}
            >
              Zur Kasse
            </button>

            {checkoutError ? (
              <p
                className="text-[var(--color-stone)]"
                aria-live="polite"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "var(--text-caption)",
                }}
              >
                {checkoutError}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </>
  );
}
