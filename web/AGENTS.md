<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Learnings

- Hamster task status in `.hamster/` can lag the actual `web/` implementation. Audit the codebase and run `pnpm lint`, `pnpm typecheck`, and `pnpm test` before treating a `todo` task as unimplemented.
- The Stripe webhook must enqueue `fulfill-order` with an idempotency key derived from the Stripe session ID so retries remain safe even after the `orders` row already exists.
- If purchase analytics must be authoritative, pass the storefront analytics session ID and UTM source through Stripe Checkout metadata so the webhook can persist `purchase_complete` server-side without relying on the confirmation page.
- In Next 16 with `@sentry/nextjs`, prefer root `instrumentation.ts` plus `instrumentation-client.ts`; `sentry.client.config.ts` is effectively legacy and triggers Turbopack deprecation warnings.
- `hamster task status` can fail in the sandbox because it attempts re-auth via a local callback server and browser launch. When that happens, reconcile the local `.hamster/.../tasks/*.md` status fields directly.
- Prodigi webhooks can arrive out of order. Keep order status updates forward-only so a late `in_production` or `failed` event cannot regress an order that is already `shipped` or `delivered`.
- Current Prodigi v4 callbacks are unsigned CloudEvents. Parse the order from `data`/`data.order`, use `subject` as the order id, and configure sandbox vs live explicitly via `PRODIGI_API_BASE_URL`.
- The `neckarstuecke-web` Vercel project needs `rootDirectory=web`, `framework=nextjs`, `buildCommand=pnpm build`, `installCommand=pnpm install`, `outputDirectory=.next`, and `nodeVersion=22.x`; patching `/v9/projects/:id` via `vercel api` is the fastest way to fix drift.
- Vitest will crawl `node_modules` and Playwright files unless `web/vitest.config.ts` narrows `include` to the repo `__tests__` folders and excludes `e2e`, `playwright-report`, and `test-results`.
