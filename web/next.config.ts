import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const blobHostname = process.env.NEXT_PUBLIC_PRINT_CDN_BASE
  ? new URL(process.env.NEXT_PUBLIC_PRINT_CDN_BASE).hostname
  : null;

const nextConfig: NextConfig = {
  images: blobHostname
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: blobHostname,
            pathname: "/**",
          },
        ],
      }
    : undefined,
};

export default withSentryConfig(nextConfig, {
  authToken: process.env.SENTRY_AUTH_TOKEN,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  release: {
    name: process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.SENTRY_RELEASE,
  },
  silent: !process.env.CI,
  telemetry: false,
  webpack: {
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
