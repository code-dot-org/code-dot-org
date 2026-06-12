import {defineConfig, devices} from '@playwright/test';

const isCI = !!process.env.CI;
// Drone sets CI; the DTT daemon doesn't — but both run `yarn test:ui:ci`, which
// sets PLAYWRIGHT_CI. Gate the report artifacts on this, not isCI, to cover both
// lanes. Local runs (`test:ui:local`) set neither and stay lean.
const isAutomated = isCI || !!process.env.PLAYWRIGHT_CI;
const htmlReport = {outputFolder: 'playwright-report', open: 'never'} as const;

/**
 * Playwright config for the e2e-tests suite.
 *
 * Target host defaults to https://test-studio.code.org (always-on test env); set
 * TARGET_URL to point at another deployment — e.g. a PR's adhoc — so a PR run
 * exercises that PR's code rather than the static test env. No webServer block.
 * Default run lane is Chromium; Firefox and WebKit are opt-in via `--project=...`.
 * Sharding is CLI-only: pass `--shard=$i/$n`.
 *
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  // 1 retry in CI to absorb flake; the retried attempt is traced (`trace` below).
  retries: isCI ? 1 : 0,
  // Tests tagged {tag: '@no_ci'} need infra the automated lane lacks (e.g.
  // Javabuilder). grepInvert matches {tag} metadata as well as title text
  // since Playwright 1.42; use {tag: '@no_ci'} in test definitions, not title embedding.
  grepInvert: isCI ? /@no_ci/ : undefined,
  workers: isCI ? '100%' : undefined,
  // 'list' always streams pass/fail to the live log — the only place failures show
  // while the suite runs non-blocking. 'html' (uploaded + linked in Slack) and
  // 'json' (the #infra-test summary) are CI/DTT-only; local stays list-only.
  reporter: isAutomated
    ? [
        ['list'],
        ['html', htmlReport],
        ['json', {outputFile: 'test-results/results.json'}],
      ]
    : 'list',
  timeout: 90_000,
  expect: {timeout: 15_000},
  use: {
    baseURL: process.env.TARGET_URL ?? 'https://test-studio.code.org',
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
