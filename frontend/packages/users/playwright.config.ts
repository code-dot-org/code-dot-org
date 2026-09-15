import {defineConfig, devices} from '@playwright/test';

// Self-contained e2e: Playwright drives the package's own standalone dev server
// (the same page Studio lazy-loads) in MSW mode. Studio-host concerns — the
// lazy-chunk boundary and the signed-out sign-in redirect — are covered by the
// route's unit tests (signInRedirectHref) and manual Studio-MSW verification,
// not here.
const PORT = 5199;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: {
    command: `VITE_API_MODE=msw yarn dev --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
