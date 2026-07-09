import {defineConfig, devices} from '@playwright/test';

import {visualProjects} from '@code-dot-org/playwright-support/visual';

// Set by each automated lane's entry point (GitHub Actions workflow, rake task); unset = local.
const provider = process.env.PLAYWRIGHT_PROVIDER; // 'github-actions' | 'drone' | 'dtt' | undefined
const isAutomated = !!provider;
const htmlReport = {outputFolder: 'playwright-report', open: 'never'} as const;

// @visual tests run only under the visual-* projects (see visualProjects below).
// @no_ci tests need backends Drone's freshly-built instance lacks (e.g. Javabuilder,
// LLM APIs), so skip them there too. Mirrors the Cucumber --ci skip.
const functionalGrepInvert: RegExp[] = [/@visual/];
if (provider === 'drone') {
  functionalGrepInvert.push(/@no_ci/);
}

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
  retries: isAutomated ? 2 : 0,
  // 100% only on GitHub Actions (dedicated runner, external server); Drone/DTT share CPU.
  workers: provider === 'github-actions' ? '100%' : undefined,
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
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
      grepInvert: functionalGrepInvert,
    },
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
      grepInvert: functionalGrepInvert,
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
      grepInvert: functionalGrepInvert,
    },
    // Applitools/native-screenshot lane for @visual tests; [] unless VISUAL_PROVIDER is set.
    ...visualProjects(),
  ],
});
