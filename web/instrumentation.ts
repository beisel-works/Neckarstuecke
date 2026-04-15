import { captureRequestError } from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";

const environment =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

export async function register(): Promise<void> {
  registerOTel({
    serviceName: "neckarstuecke",
    attributes: {
      "deployment.environment.name": environment,
    },
  });

  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = (...args: Parameters<typeof captureRequestError>) => {
  captureRequestError(...args);
};
