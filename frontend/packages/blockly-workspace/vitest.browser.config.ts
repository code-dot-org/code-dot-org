import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

// Browser-mode tests for the parts of the package that need a real browser:
// Blockly injection and rendering depend on SVG layout (getBBox, getHeightWidth,
// metrics) that jsdom does not implement. Kept separate from the jsdom unit
// tests so `yarn test` does not require launching a browser. Run with
// `yarn test:browser` (or `:update` to refresh any screenshot baselines).
export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.browser.test.{ts,tsx}'],
    browser: {
      enabled: true,
      headless: true,
      provider: playwright({}),
      viewport: {width: 1024, height: 768},
      instances: [{browser: 'chromium'}],
      // Don't drop generic capture-on-failure images into __screenshots__; that
      // directory holds the intentional toMatchScreenshot baselines we commit.
      // toMatchScreenshot still writes its own actual/diff on mismatch.
      screenshotFailures: false,
    },
  },
});
