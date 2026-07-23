import {defineConfig, devices} from '@playwright/test';

// Self-contained visual e2e: Playwright drives the package's own standalone dev
// host in MSW mode. The dev server is expected to already be running on PORT
// (via `VITE_API_MODE=msw yarn dev`); in CI, a webServer block starts it.
const PORT = 5173;
const CI_PORT = 5198;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${process.env.CI ? CI_PORT : PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: process.env.CI
    ? {
        command: `VITE_API_MODE=msw yarn dev --port ${CI_PORT} --strictPort`,
        url: `http://localhost:${CI_PORT}/`,
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
});
