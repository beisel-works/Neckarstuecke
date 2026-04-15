"use client";

import { useCart } from "@/context/CartContext";

/**
 * Client island — cart icon with live item-count badge.
 * Rendered inside the Server Component Header via a client boundary.
 */
export default function CartButton() {
  const { itemCount, hydrated, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={
        hydrated && itemCount > 0
          ? `Warenkorb öffnen — ${itemCount} ${itemCount === 1 ? "Artikel" : "Artikel"}`
          : "Warenkorb öffnen"
      }
      className="relative flex items-center gap-1.5 text-[var(--color-charcoal)] hover:text-[var(--color-sage)] transition-colors"
      style={{
        fontFamily: "var(--font-sans)",
        fontSize: "var(--text-label)",
        letterSpacing: "var(--tracking-label)",
        fontWeight: 500,
      }}
    >
      {/* Bag icon */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6.5 7V5.5a3.5 3.5 0 0 1 7 0V7" />
        <rect x="3" y="7" width="14" height="11" rx="1" />
      </svg>

      {/* Count badge — hidden until hydrated (avoids SSR mismatch). */}
      {hydrated && itemCount > 0 && (
        <span
          className="absolute -top-2 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-sage)] text-[var(--color-paper)] px-0.5"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.625rem",
            fontWeight: 500,
            lineHeight: 1,
          }}
          aria-hidden="true"
        >
          {itemCount > 99 ? "99+" : itemCount}
        </span>
      )}
    </button>
  );
}
