import {defineConfig, devices} from '@playwright/test';

/**
 * Playwright config for documentation journeys. Separate from the main e2e
 * config: testDir is docs-journeys/, not tests/, so CI never picks these up.
 * Run with: yarn workspace @code-dot-org/e2e-tests docs:journeys
 */
export default defineConfig({
  testDir: './docs-journeys',
  fullyParallel: false,
  // One shared dev server; parallel workers time out on lab loads.
  workers: 1,
  retries: 0,
  reporter: 'list',
  timeout: 90_000,
  expect: {timeout: 15_000},
  use: {
    baseURL: 'http://localhost-studio.code.org:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
});
