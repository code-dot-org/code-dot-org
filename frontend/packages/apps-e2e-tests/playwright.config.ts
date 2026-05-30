import {defineConfig, devices} from '@playwright/test';

const isCI = !!process.env.CI;
const htmlReport = {outputFolder: 'playwright-report', open: 'never'} as const;

/**
 * Playwright config for the apps-e2e-tests suite.
 *
 * Tests run against https://test-studio.code.org (always-on test environment), so
 * there is no webServer block. Default run lane is Chromium; Firefox and WebKit
 * projects exist but are opt-in via `--project=firefox` / `--project=webkit`.
 * Sharding is CLI-only: pass `--shard=$i/$n`.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: 0,
  // @no_ci-tagged tests need infra the automated lane lacks (e.g. Javabuilder).
  grepInvert: isCI ? /@no_ci/ : undefined,
  workers: isCI ? '100%' : undefined,
  reporter: isCI
    ? [
        ['html', htmlReport],
        ['junit', {outputFile: 'test-results/junit.xml'}],
      ]
    : 'list',
  timeout: 90_000,
  expect: {timeout: 15_000},
  use: {
    baseURL: 'https://test-studio.code.org',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
    {name: 'webkit', use: {...devices['Desktop Safari']}},
  ],
});
