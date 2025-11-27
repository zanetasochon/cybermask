import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests/e2e",
  outputDir: "test-results",

  // Timeouts and expect defaults
  timeout: 30_000,
  expect: { timeout: 5_000 },

  // Execution model
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  // Reporters
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["line"], ["html", { open: "never" }]],

  // Shared context
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:3000",
    navigationTimeout: 10_000,
    actionTimeout: 0,
    trace: isCI ? "on-first-retry" : "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  // Browsers: run all on CI, just Chromium locally for speed
  projects: isCI
    ? [
        { name: "chromium", use: { ...devices["Desktop Chrome"] } },
        { name: "firefox", use: { ...devices["Desktop Firefox"] } },
        { name: "webkit", use: { ...devices["Desktop Safari"] } },
      ]
    : [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  // Serve the built Next.js app for stable E2E
  webServer: [
    {
      command: "npm run start",
      env: { PORT: "3000" },
      url: "http://localhost:3000",
      reuseExistingServer: !isCI,
      timeout: 120_000,
    },
  ],
});
