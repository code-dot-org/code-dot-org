import {defineConfig} from 'vitest/config';

// Node-environment unit tests for the pure helpers (e.g. visualProjects).
// The fixture backends need a real browser and are exercised by consuming
// packages' Playwright e2e, not here.
export default defineConfig({
  test: {
    globals: true,
    exclude: ['node_modules/**', 'dist/**'],
  },
});
