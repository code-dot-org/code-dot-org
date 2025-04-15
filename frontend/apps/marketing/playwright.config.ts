import 'dotenv/config';
import {EyesFixture} from '@applitools/eyes-playwright/fixture';
import {defineConfig, devices} from '@playwright/test';

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<EyesFixture>({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? '75%' : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: '@applitools/eyes-playwright/reporter',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
    eyesConfig: {
      appName: 'Marketing',
      matchLevel: 'Strict',
      // Runner type: 'ufg' for Ultrafast Grid, 'classic' for Classic runner
      type: 'classic',
      batch: {
        name: 'Frontend Eyes Tests',
        id: process.env.APPLITOOLS_BATCH_ID,
        notifyOnCompletion: false,
      },
      sendDom: true,
      failTestsOnDiff: 'afterEach',
      // Additional configuration options...
    },
  },

  /* Configure projects for major browsers */
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

  /* Run your local dev server before starting the tests */
  ...(process.env.STAGE === 'pr'
    ? {
        webServer: {
          command: 'cd ../../ && yarn dev --filter @code-dot-org/marketing',
          url: 'http://localhost:3001',
          reuseExistingServer: true,
        },
      }
    : undefined),
});
