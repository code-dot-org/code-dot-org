import {defineConfig, devices} from 'playwright/test';

/**
 * Base URL of the standalone oceans dev server.
 * Override with TARGET_URL env var to target a different host.
 */
const BASE_URL = process.env.TARGET_URL ?? 'http://localhost:5173';

/**
 * Playwright configuration for the AI for Oceans standalone dev server.
 *
 * Tests live in `./e2e/`. The `webServer` block auto-starts `yarn dev` at
 * port 5173 and re-uses a server already running at that address, so you can
 * leave `yarn dev` running in a separate terminal for a faster iteration loop.
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
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        // Disable Firefox background-tab timer throttling so setTimeout-based
        // animations (e.g. Typist at 35ms intervals) run at full speed in
        // headless mode.  Without this, Firefox can delay timers to ≥1000ms
        // when the page is not the OS-focused window, causing the guide's
        // Typist animation to stall and "Enter dismisses" tests to time out.
        launchOptions: {
          firefoxUserPrefs: {
            'dom.timeout.background_throttling_max_budget': -1,
            'dom.min_background_timeout_value': 0,
          },
        },
      },
      grepInvert: /@visual/,
    },
    {
      name: 'webkit',
      use: {...devices['Desktop Safari']},
      grepInvert: /@visual/,
    },
    // Visual projects register only when VISUAL_PROVIDER is set; `playwright
    // test` (no args) runs the 3 e2e projects only.
    ...(process.env.VISUAL_PROVIDER
      ? (
          [
            ['visual-chromium', 'Desktop Chrome'],
            ['visual-firefox', 'Desktop Firefox'],
            ['visual-webkit', 'Desktop Safari'],
          ] as const
        ).map(([name, device]) => ({
          name,
          use: {...devices[device]},
          grep: /@visual/,
          retries: 0,
          fullyParallel: false,
          snapshotPathTemplate:
            '{testDir}/tmp/baselines/{testFileName}/{arg}-{projectName}-{platform}{ext}',
        }))
      : []),
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
