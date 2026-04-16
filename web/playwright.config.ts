import {
  defineConfig,
  devices,
  type ReporterDescription,
} from "@playwright/test";

const isCI = Boolean(process.env.CI);
const baseURL =
  process.env.PLAYWRIGHT_BASE_URL ??
  process.env.E2E_BASE_URL ??
  "http://localhost:3000";
const vercelAutomationBypassSecret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;
const extraHTTPHeaders =
  vercelAutomationBypassSecret && baseURL.includes(".vercel.app")
    ? { "x-vercel-protection-bypass": vercelAutomationBypassSecret }
    : undefined;

function getReporters(): ReporterDescription[] {
  if (isCI) {
    return [
      ["github"],
      ["junit", { outputFile: "test-results/e2e/junit.xml" }],
      ["html", { open: "never", outputFolder: "playwright-report" }],
    ];
  }

  return [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ];
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  retries: isCI ? 2 : 0,
  reporter: getReporters(),
  outputDir: "test-results/e2e",
  use: {
    baseURL,
    extraHTTPHeaders,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer:
    process.env.PLAYWRIGHT_BASE_URL || process.env.E2E_BASE_URL
      ? undefined
      : {
          command: "pnpm exec next dev --hostname localhost --port 3000",
          url: baseURL,
          reuseExistingServer: !isCI,
          stdout: "pipe",
          stderr: "pipe",
          timeout: 240_000,
        },
});
