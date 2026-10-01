import {defineConfig, devices} from '@playwright/test';

// Self-contained: Playwright drives this package's own dev server in MSW mode,
// on video.html (see src/dev/video.tsx). The deep dive's main page needs
// apps' generated shared constants, which CI does not have, so it is not
// under test here.
const PORT = 5197;
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  expect: {timeout: 10_000},
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: {
    command: `VITE_API_MODE=msw yarn dev --port ${PORT} --strictPort`,
    url: `${BASE_URL}/video.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
