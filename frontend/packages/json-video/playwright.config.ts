import {defineConfig, devices} from 'playwright/test';

/**
 * Base URL of the standalone json-video demo dev server.
 * Override with TARGET_URL env var to target a different host.
 */
const BASE_URL = process.env.TARGET_URL ?? 'http://localhost:5179';

/**
 * Playwright configuration for the json-video demo (demo/). The `webServer`
 * block auto-starts `yarn dev` at port 5179, a port no other package uses, so
 * an already-running server there is always this package's.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '100%' : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
  ],
  webServer: {
    command: 'yarn dev --port 5179 --strictPort',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
