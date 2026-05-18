import {defineConfig, devices} from '@playwright/test';

const isCI = !!process.env.CI;
const htmlReportOptions = {outputFolder: 'playwright-report', open: 'never'};

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
  forbidOnly: isCI,
  retries: 0,
  // Tests tagged @no_ci require infra not available in automated runs
  // (e.g. Javabuilder WebSocket).  Skip them in CI; run manually against
  // test-studio.
  grepInvert: isCI ? /@no_ci/ : undefined,
  workers: isCI ? '100%' : undefined,
  reporter: [
    isCI
      ? ['html', htmlReportOptions]
      : ['@applitools/eyes-playwright/reporter', htmlReportOptions],
    ['junit', {outputFile: 'test-results/junit.xml'}],
  ],

  timeout: 90_000,
  expect: {timeout: 15_000},

  use: {
    baseURL: 'https://test-studio.code.org',
    eyesConfig: {failTestsOnDiff: 'afterEach'},
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  } as never,

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
  ],
});
