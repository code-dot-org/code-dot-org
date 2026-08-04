import {defineConfig, devices} from '@playwright/test';

// Module-owned Playwright flow: Playwright drives the package's own standalone
// dev host, which serves the deep-dive flow with MSW mocks and @cdo/* stubs —
// zero backend, zero apps/ build. The webServer block boots that dev host on
// PORT; reuseExistingServer lets a dev server you already have running be
// reused instead of spawning a second one.
const PORT = 5310;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}],
  webServer: {
    command: `yarn dev --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
