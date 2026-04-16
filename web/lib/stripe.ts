import Stripe from "stripe";

/**
 * Server-side Stripe client singleton.
 * Import this in API Route Handlers and Server Actions only — never in Client Components.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY         — Stripe secret key (sk_test_… / sk_live_…)
 *   STRIPE_WEBHOOK_SECRET     — Stripe webhook signing secret (whsec_…)
 *   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY — Stripe publishable key (pk_test_… / pk_live_…)
 */

/** Lazily-initialised Stripe client — throws on first access if the key is missing. */
let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "Missing STRIPE_SECRET_KEY environment variable. Add it to .env.local and Vercel project settings."
    );
  }
  _stripe = new Stripe(key, {
    apiVersion: "2026-03-25.dahlia",
    typescript: true,
  });
  return _stripe;
}

/**
 * Convenience export — equivalent to calling getStripe().
 * Use getStripe() in code paths where you need an explicit error boundary.
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return getStripe()[prop as keyof Stripe];
  },
});

// ---------------------------------------------------------------------------
// SKU → Stripe Price ID mapping
//
// Each PrintVariant maps to a Stripe Price object (one-time, EUR).
// Keys are `${print_slug}__${size_label}__${format}` (normalised).
// Values are Stripe Price IDs (price_…).
//
// Populate these after creating Products/Prices in the Stripe dashboard
// or via the seed script `scripts/stripe-seed.ts`.
//
// For Stripe test mode the IDs begin with "price_" and can be created via:
//   stripe prices create --currency eur --unit-amount <cents> \
//     --product-data[name]="<name>" --lookup-key <key>
// ---------------------------------------------------------------------------

export type StripePriceMap = Record<string, string>;

/**
 * Returns the Stripe Price ID for a given variant combination.
 * Falls back to `undefined` when the key has not been configured —
 * checkout session creation will throw a descriptive error in that case.
 */
export function getStripePriceId(
  printSlug: string,
  sizeLabel: string,
  format: string
): string | undefined {
  const key = normaliseSkuKey(printSlug, sizeLabel, format);
  const vercelSafeKey = key.replace(/-/g, "_");
  return (
    process.env[`STRIPE_PRICE_${vercelSafeKey}`] ??
    process.env[`STRIPE_PRICE_${key}`] ??
    undefined
  );
}

/**
 * Canonical SKU key used both as env-var suffix and as Stripe Price lookup key.
 * Example: "minneburg__30x40-cm__print"
 */
export function normaliseSkuKey(
  printSlug: string,
  sizeLabel: string,
  format: string
): string {
  return [printSlug, sizeLabel, format]
    .map((s) =>
      s
        .toLowerCase()
        .replace(/[×x]/g, "x") // normalise multiplication sign
        .replace(/\s+/g, "-") // spaces to hyphens
        .replace(/[^a-z0-9-]/g, "") // strip non-alphanumeric except hyphens
    )
    .join("__")
    .toUpperCase(); // env vars are conventionally uppercase
}
