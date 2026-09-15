import {configDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // jsdom supplies the DOM globals (DOMParser, document, ...) the source and
    // tests rely on; @testing-library/jest-dom adds the DOM matchers.
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    // Browser-mode tests run in a real browser via vitest.browser.config.ts;
    // they need real SVG layout that jsdom cannot provide.
    exclude: [...configDefaults.exclude, '**/*.browser.test.{ts,tsx}'],
  },
});
