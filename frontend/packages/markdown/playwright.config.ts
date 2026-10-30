import {defineConfig, devices} from 'playwright/test';

import {visualProjects} from '@code-dot-org/playwright-support/visual';

/**
 * Base URL of the standalone markdown demo dev server.
 * Override with TARGET_URL env var to target a different host.
 */
const BASE_URL = process.env.TARGET_URL ?? 'http://localhost:5173';

/**
 * Playwright configuration for the markdown demo (demo/). The `webServer` block
 * auto-starts `yarn dev` at port 5173 and re-uses a server already running
 * there, so you can leave `yarn dev` running for a faster iteration loop.
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
  expect: {
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.01,
    },
  },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
      grepInvert: /@visual/,
    },
    // Visual projects register only when VISUAL_PROVIDER is set (chromium-only
    // by default); `playwright test` with no args runs the functional project.
    ...visualProjects(),
  ],
  webServer: {
    command: 'yarn dev --port 5173',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
