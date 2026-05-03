import {defineConfig, devices} from '@playwright/test';

/**
 * Playwright configuration for the apps-e2e-tests suite.
 *
 * Default run target: Chromium only (PoC lane). Firefox and WebKit projects
 * are present but excluded from the default run; invoke them explicitly via
 * `--project=firefox` / `--project=webkit`.
 *
 * Sharding: pass `--shard=$index/$total` on the CLI; no config changes needed.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: undefined,
  reporter: [['html', {outputFolder: 'playwright-report'}]],

  timeout: 90_000,
  expect: {timeout: 15_000},

  use: {
    baseURL: 'https://test-studio.code.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
    },
    /**
     * Visual-diff lane. Gates Applitools / screenshot-diff runs behind the
     * @visual tag; not exercised in this PoC. Run with --project=visual or
     * filter by tag: `yarn test --grep @visual`.
     */
    {
      name: 'visual',
      use: {...devices['Desktop Chrome']},
      grep: /@visual/,
    },
  ],
});
