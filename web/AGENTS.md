<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learnings

- The legal pages live in `web/app/impressum/page.tsx` and `web/app/datenschutz/page.tsx`. `web/app/layout.tsx` mounts `Footer` globally, and `web/components/Footer.tsx` already links both legal routes, so footer-level legal reachability is a verification task unless the brief explicitly asks for header changes.
- Hamster task status in `.hamster/` can lag the actual `web/` implementation. Audit the codebase and run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before treating a `todo` task as unimplemented.
- The Stripe webhook must enqueue `fulfill-order` with an idempotency key derived from the Stripe session ID so retries remain safe even after the `orders` row already exists.
- If purchase analytics must be authoritative, pass the storefront analytics session ID and UTM source through Stripe Checkout metadata so the webhook can persist `purchase_complete` server-side without relying on the confirmation page.
- In Next 16 with `@sentry/nextjs`, prefer root `instrumentation.ts` plus `instrumentation-client.ts`; `sentry.client.config.ts` is effectively legacy and triggers Turbopack deprecation warnings.
- `hamster task status` can fail in the sandbox because it attempts re-auth via a local callback server and browser launch. When that happens, reconcile the local `.hamster/.../tasks/*.md` status fields directly.
- Prodigi webhooks can arrive out of order. Keep order status updates forward-only so a late `in_production` or `failed` event cannot regress an order that is already `shipped` or `delivered`.
- Current Prodigi v4 callbacks are unsigned CloudEvents. Parse the order from `data`/`data.order`, use `subject` as the order id, and configure sandbox vs live explicitly via `PRODIGI_API_BASE_URL`.
- Prodigi framed paper support is inconsistent across endpoints. `GET /products/GLOBAL-CFP-*` reports EMA-only, but the live Quote endpoint accepts both `paperType=HGE` and `paperType=EMA` for Germany. Treat Quote as the decision source for framed paper selection, not Product Details.
- Neckarstuecke framed fulfillment defaults to `GLOBAL-CFP-*` with `color=natural`, tries `paperType=HGE` first, and falls back to `paperType=EMA` only if HGE is rejected for the actual order context.
- The `neckarstuecke-web` Vercel project needs `rootDirectory=web`, `framework=nextjs`, `buildCommand=pnpm build`, `installCommand=pnpm install`, `outputDirectory=.next`, and `nodeVersion=22.x`; patching `/v9/projects/:id` via `vercel api` is the fastest way to fix drift.
- If the global `vercel` binary is missing on PATH, use `npx vercel` from `web/` before treating the CLI as unavailable; it works against the linked `neckarstuecke-web` project and existing local auth/session state.
- Vitest will crawl `node_modules` and Playwright files unless `web/vitest.config.ts` narrows `include` to the repo `__tests__` folders and excludes `e2e`, `playwright-report`, and `test-results`.
- Vercel Authentication-protected previews expose the automation bypass secret under `protectionBypass` on `/v9/projects/:id`; Playwright needs the `x-vercel-protection-bypass` header plus a one-time `?x-vercel-set-bypass-cookie=true` navigation before normal browser flows.
- The Vercel CLI `env add` flow is awkward for non-interactive preview upserts; `POST /v10/projects/:id/env?upsert=true&teamId=...` is the reliable write path. A production build succeeds once `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`, and the Sentry vars are present, even if Stripe, Prodigi, Trigger, and service-role secrets are still unset for runtime features.
- Supabase now prefers `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and `SUPABASE_SECRET_KEY`. The app should read those first and only fall back to `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY` during migration.
- Supabase preview branching is unavailable on the current hosted org plan. `supabase branches create` returns `402`, so CI must use a local Supabase stack with committed `supabase/config.toml`, migrations, and `seed.sql` to validate schema-changing work before merge.
- A Vercel custom domain can be correctly configured and still show `DEPLOYMENT_NOT_FOUND` when no production deployment exists. Verify domain state with both `vercel inspect` and a direct `curl -I` before concluding DNS or nameservers are wrong.
- Handled operational `5xx` failures in route handlers must either be rethrown or sent to Sentry explicitly. Returning `500` or `202` from a `catch` without `captureException` hides the error from production observability.
- A Sentry smoke endpoint returning an `eventId` does not prove the event landed in the intended project. Verify the live `SENTRY_DSN`/`NEXT_PUBLIC_SENTRY_DSN` against `GET /api/0/projects/{org}/{project}/keys/`; stale DSNs can silently send events to a different project.
- Catalog images are sourced from Supabase URL fields, not inferred from repo assets. Shipping new motifs requires syncing `motifs/exports/manifest.json` to Blob and updating `prints.image_web_preview_url`, `image_thumbnail_url`, and `image_og_url` in the same release flow.
- Product pages can now render a secondary framed preview. The asset sync flow must update `prints.image_mockup_url` together with the existing preview, thumbnail, and OG URLs.
- Overwriting an existing Vercel Blob pathname is not enough to refresh storefront imagery reliably because Next image optimization can keep serving the previous optimized result. Catalog asset URLs need a version query or unique pathname when artwork changes.
- The Vercel CLI `--scope` value in GitHub Actions should be the team slug, not the team id used in REST `teamId` parameters. Keep them as separate secrets (`VERCEL_SCOPE` for CLI, `VERCEL_ORG_ID` for API) to avoid `scope-not-accessible` failures.
- Checkout can no longer rely on Stripe line-item descriptions once it uses saved Stripe Price IDs. Persist `cart_items` in Checkout Session metadata and rebuild `orders.line_items` / `order_items` from that metadata in the webhook.
- The repo still has no first-party admin auth stack. Internal `/admin/coa` access is currently gated with HTTP Basic Auth via `COA_ADMIN_USERNAME` / `COA_ADMIN_PASSWORD`.
- Vercel environment variable names cannot contain hyphens. Keep Stripe lookup keys as `BAD-WIMPFEN__30X40-CM__PRINT`, but convert hyphens to underscores in actual `STRIPE_PRICE_*` env var names and support the legacy hyphenated names as a fallback in code.
- Collection brief notes may reference `web/app/prints/page.tsx`, but the actual collection catalog route is `web/app/kollektion/page.tsx`.
