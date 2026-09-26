import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:4173";
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.mjs",

  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: isCI,

  timeout: 30_000,

  expect: {
    timeout: 5_000,
  },

  reporter: "list",
  outputDir: "test-results",

  use: {
    baseURL,
    headless: true,
    viewport: { width: 1280, height: 800 },
    serviceWorkers: "block",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  projects: [
    isCI
      ? {
          name: "chromium",
          use: {
            browserName: "chromium",
          },
        }
      : {
          name: "edge",
          use: {
            browserName: "chromium",
            channel: "msedge",
          },
        },
  ],

  webServer: {
    command: "npm run build && npm run preview",
    url: baseURL,
    timeout: 120_000,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
  },
});