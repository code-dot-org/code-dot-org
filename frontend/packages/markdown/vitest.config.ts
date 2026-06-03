import {configDefaults, defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // Visual tests run in a real browser via vitest.visual.config.ts.
    exclude: [...configDefaults.exclude, '**/*.visual.test.{ts,tsx}'],
  },
});
