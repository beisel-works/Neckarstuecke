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
