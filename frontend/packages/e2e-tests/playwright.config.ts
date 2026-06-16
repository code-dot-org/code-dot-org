import {defineConfig, devices} from '@playwright/test';

// The lane this run is in. Set by each automated entry point: the GHA workflow
// step (gha), and the rake task for Drone/DTT (drone/dtt). Unset = local → lean.
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
  // Fail any automated lane if a `.only` was committed.
  forbidOnly: isAutomated,
  // 1 retry on every automated lane so flake doesn't pass one lane and fail
  // another; the retried attempt is traced (`trace` below).
  retries: isAutomated ? 1 : 0,
  // @no_ci is skipped only on Drone, whose in-container localhost build lacks
  // services like Javabuilder; the DTT and GHA hit the deployed env and run them
  // (matches the Cucumber suite, where only the --ci/Drone path skips @no_ci).
  // grepInvert matches {tag} metadata as well as title text since Playwright 1.42;
  // use {tag: '@no_ci'} in test definitions, not title embedding.
  grepInvert: provider === 'drone' ? /@no_ci/ : undefined,
  // 100% only on GHA: its runner is dedicated to the test workers and the target
  // server is external. Drone shares its container with the server-under-test and
  // the DTT is a shared daemon — both keep Playwright's default.
  workers: provider === 'gha' ? '100%' : undefined,
  // 'list' always streams pass/fail to the live log. 'html' and 'json' are the
  // automated-lane artifacts (the report and machine-readable results); local
  // runs stay list-only.
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
