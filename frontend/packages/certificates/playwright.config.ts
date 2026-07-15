import {defineConfig, devices} from 'playwright/test';

import {visualProjects} from '@code-dot-org/playwright-support/visual';

const BASE_URL = process.env.TARGET_URL ?? 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  timeout: 60_000,
  use: {
    baseURL: BASE_URL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
      grepInvert: /@visual/,
    },
    // Firefox renders canvas text differently (a Firefox-only clipping bug
    // shipped while this suite was chromium-only); keep both engines covered.
    {
      name: 'firefox',
      use: {...devices['Desktop Firefox']},
      grepInvert: /@visual/,
    },
    ...visualProjects(),
  ],
  webServer: {
    command: 'yarn dev --host 127.0.0.1 --port 5173',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
