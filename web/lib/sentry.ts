import * as Sentry from "@sentry/nextjs";

interface CaptureHandledExceptionOptions {
  surface: string;
  statusCode: number | string;
  extras?: Record<string, unknown>;
  tags?: Record<string, string>;
}

export function captureHandledException(
  error: unknown,
  { surface, statusCode, extras, tags }: CaptureHandledExceptionOptions
): string {
  const exception =
    error instanceof Error ? error : new Error(typeof error === "string" ? error : "Unknown error");

  return Sentry.withScope((scope) => {
    scope.setTag("handled", "true");
    scope.setTag("surface", surface);
    scope.setTag("status_code", String(statusCode));

    if (tags) {
      for (const [key, value] of Object.entries(tags)) {
        scope.setTag(key, value);
      }
    }

    if (extras) {
      for (const [key, value] of Object.entries(extras)) {
        if (value !== undefined) {
          scope.setExtra(key, value);
        }
      }
    }

    return Sentry.captureException(exception);
  });
}
