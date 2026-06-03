import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

// Visual-regression tests: render scenarios in a real (headless) browser and
// compare against committed screenshots. Kept separate from the jsdom unit
// tests so `yarn test` does not require launching a browser. Baselines are
// generated/updated with `yarn test:visual:update`.
export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.visual.test.{ts,tsx}'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      instances: [{browser: 'chromium'}],
    },
  },
});
