# Neckarstuecke Soft-Launch Runbook

Task coverage:
- `BEI-10` verification
- `BEI-28` production readiness
- remaining production-only acceptance for `BEI-5`, `BEI-6`, `BEI-9`

## Preconditions

- Vercel production deployment is live at `https://neckarstuecke.de`
- Supabase migrations `001` to `004` are applied
- Stripe live keys, webhook secret, and product price IDs are configured
- Trigger.dev is deployed with `fulfill-order`
- Prodigi sandbox or live credentials are configured
- Prodigi callback URL is configured either in the dashboard or via `PRODIGI_CALLBACK_URL`
- Sentry DSN and auth settings are configured
- `SENTRY_SMOKE_TOKEN` is configured
- print asset CDN is reachable from Prodigi

## Required Environment Variables

Server-side:
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `TRIGGER_SECRET_KEY`
- `PRODIGI_API_KEY`
- `PRODIGI_API_BASE_URL`
- `PRODIGI_CALLBACK_URL`
- `SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `SENTRY_SMOKE_TOKEN`
- `SENTRY_RELEASE`
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`

Client-visible:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_RELEASE`
- `NEXT_PUBLIC_VERCEL_ENV`
- `NEXT_PUBLIC_PRINT_CDN_BASE`
- `NEXT_PUBLIC_SITE_URL`

## Production Smoke Test

1. Open the production site and verify:
- homepage loads
- collection page loads
- product detail page loads
- cart drawer opens
- Impressum and Datenschutzerklaerung load

2. Verify observability before purchase:
- request `GET /api/health/observability`
- confirm a trace appears in the OTel backend
- request `POST /api/health/sentry` with `Authorization: Bearer <SENTRY_SMOKE_TOKEN>`
- confirm a Sentry event appears with tags `surface=health.sentry`, `handled=true`, and `smoke=true`
- trigger a controlled frontend error in production or preview and confirm Sentry captures it with the correct release and environment

3. Run one real purchase:
- use a low-cost live SKU
- complete checkout with a real card
- note the Stripe session ID and order ID

4. Verify post-purchase systems:
- `orders` row exists in Supabase with `status = paid` or later
- `analytics_events` contains `purchase_complete`
- Trigger.dev ran `fulfill-order`
- order was submitted to Prodigi and `supplier_order_id` was stored

5. Verify supplier callbacks:
- Prodigi webhook reaches `/api/webhooks/prodigi`
- order status advances forward only: `submitted -> in_production -> shipped -> delivered`
- tracking number is stored once present

6. Refund the smoke-test purchase immediately in Stripe.

## Known Blockers

- Confirmation email is part of the acceptance text for `BEI-28`, but there is no confirmation-email sender in the repository today. Treat that item as blocked until email delivery is implemented or the task text is corrected.
- `BEI-9` is not fully closed until a real Prodigi account is configured and the SKU map is verified against the live catalogue.
- `BEI-10` is not fully closed until Sentry and the trace backend are verified from production traffic.
- `BEI-5` is not fully closed until one real order completes end to end.
- `BEI-6` is not fully closed until at least one non-test conversion or one real feedback submission is recorded after launch.

## Launch Message Draft

Use a short direct message to a small trusted audience:

> Ich habe mit Neckarstuecke einen kleinen Shop fuer hochwertige Drucke aus dem Neckartal gebaut. Die erste Kollektion ist jetzt live. Wenn du Lust hast, schau mal rein: https://neckarstuecke.de
>
> Mich interessiert vor allem, welche Motive bei dir etwas ausloesen und ob sich der Shop ruhig und hochwertig anfuehlt. Ehrliches Feedback ist hilfreicher als Reichweite.

## Closeout Checklist

- [ ] production smoke test passed
- [ ] Sentry event verified
- [ ] OTel trace verified
- [ ] real purchase completed
- [ ] refund completed
- [ ] Trigger.dev fulfillment verified
- [ ] Prodigi order verified
- [ ] analytics rows verified
- [ ] first feedback or first non-test order recorded
