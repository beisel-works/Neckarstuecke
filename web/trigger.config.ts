import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  /**
   * Trigger.dev project reference.
   * Set TRIGGER_PROJECT_REF in .env.local (or as a Vercel env var).
   * Find it in the Trigger.dev dashboard → Project settings → Project ref.
   */
  project: process.env.TRIGGER_PROJECT_REF ?? "proj_neckarstucke",

  /**
   * Directories scanned for task definitions.
   * All files in ./trigger/ that export a `task(...)` are auto-registered.
   */
  dirs: ["./trigger"],

  /** Runtime: Next.js App Router uses Node.js (not the Edge runtime). */
  runtime: "node",

  /** Default compute ceiling for fulfillment jobs and webhook-triggered tasks. */
  maxDuration: 300,
});
