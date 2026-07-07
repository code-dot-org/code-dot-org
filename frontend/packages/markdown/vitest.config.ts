import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    // Playwright e2e specs (e2e/*.spec.ts) run under `test:ui`, not Vitest.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
