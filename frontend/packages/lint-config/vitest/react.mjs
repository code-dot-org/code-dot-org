import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

// Shared base for React + jsdom packages. Extend via `mergeConfig` in the
// consuming package's vitest.config.ts to add per-package options like
// `setupFiles`, `resolve.alias`, or `test.css.modules.classNameStrategy`.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
