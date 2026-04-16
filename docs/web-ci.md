# Web CI Setup

## Required GitHub secrets

Add these repository secrets before enabling the workflow:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VERCEL_SCOPE`
- `BLOB_READ_WRITE_TOKEN`
- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_DB_PASSWORD`
- `SUPABASE_PROJECT_ID`

The workflow uses the Vercel CLI to look up the deployment created by the Vercel GitHub integration for the current commit. `VERCEL_TOKEN` must have access to the linked Vercel team/project. `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` come from `web/.vercel/project.json` after `vercel link`. `VERCEL_SCOPE` must be the human-readable Vercel team/account scope used by the CLI, for example `paceypedia-2782s-projects`.

## Vercel requirements

- The Vercel project must already exist.
- The GitHub repository must be connected to the Vercel project.
- Preview deployments protected by Vercel Authentication must have a "Protection Bypass for Automation" secret configured in Project Settings -> Deployment Protection.
- The Vercel project must be configured with:
  - Root Directory: `web`
  - Framework: `nextjs`
  - Build Command: `pnpm build`
  - Install Command: `pnpm install`
  - Output Directory: `.next`
  - Node.js Version: `22.x`
- The project environment variables for preview and production must be configured in Vercel.

If you need the ids locally, `vercel link` writes them into `.vercel/project.json`. Copy the values into GitHub secrets, not into the repo.

For Supabase:

- `SUPABASE_ACCESS_TOKEN` comes from `supabase login` / the Supabase dashboard access tokens page.
- `SUPABASE_PROJECT_ID` is the project ref, for example `cdtotyivzldybjvcxsfx`.
- `SUPABASE_DB_PASSWORD` is the remote Postgres password for that project.
- `BLOB_READ_WRITE_TOKEN` comes from the connected Vercel Blob store and lets CI upload deterministic public asset paths.

## Workflow behavior

- Pull requests wait for the Vercel preview deployment for the current commit, run `pnpm lint`, `pnpm typecheck`, `pnpm test`, then run `pnpm test:e2e` against that deployed URL.
- For protected previews, the workflow reads the project `protectionBypass` settings from the Vercel API, passes the automation bypass secret into Playwright, and seeds the Vercel bypass cookie before storefront navigation.
- Pushes to `main` wait for the production deployment for the current commit and run the same validation plus E2E suite against that URL.
- Pushes to `main` also run `.github/workflows/supabase-release.yml`, which links the remote Supabase project, applies pending migrations with `supabase db push`, reapplies `supabase/seed.sql`, uploads catalog media from `motifs/exports/manifest.json` to Blob, and updates the `prints.image_*_url` fields to those public Blob URLs.
- Pull requests receive a summary comment with the deployment URL, workflow result, and test counts.
- Playwright HTML report, traces, screenshots, and videos are uploaded as workflow artifacts.

Forked pull requests do not receive repository secrets by default. If you accept external PRs, expect this workflow to fail until you choose a separate trusted deployment path for forks.

## Branch protection

Use `web-e2e` as the required status check name.

## Required preview/runtime variables

At minimum, configure these for Preview in Vercel before expecting meaningful E2E signal:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

For full checkout and order-pipeline coverage, also configure:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SUPABASE_SECRET_KEY`
- `PRODIGI_API_KEY`
- `PRODIGI_WEBHOOK_SECRET`
- `TRIGGER_PROJECT_REF`
- `NEXT_PUBLIC_PRINT_CDN_BASE`
- `SENTRY_SMOKE_TOKEN`
