import {defineConfig, devices} from '@playwright/test';

// Set by each automated lane's entry point (GHA workflow, rake task); unset = local.
const provider = process.env.PLAYWRIGHT_PROVIDER; // 'gha' | 'drone' | 'dtt' | undefined
const isAutomated = !!provider;
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
  forbidOnly: isAutomated,
  // retry in automated lanes so a flake can't pass one lane and fail another.
  retries: isAutomated ? 1 : 0,
  // @no_ci needs infra only the deployed env has — skip on Drone (localhost build),
  // run on DTT/GHA. Mirrors the Cucumber suite, where only --ci/Drone skips it.
  grepInvert: provider === 'drone' ? /@no_ci/ : undefined,
  // 100% only on GHA (dedicated runner, external server); Drone/DTT share CPU.
  workers: provider === 'gha' ? '100%' : undefined,
  // html + json artifacts only in automated lanes; local stays list-only.
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
