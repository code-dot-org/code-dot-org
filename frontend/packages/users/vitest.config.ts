import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // Unit/component tests live in src; e2e/ is Playwright's (own runner).
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    // Axe scans of the whole settings page take seconds on a busy CI runner.
    testTimeout: 20_000,
  },
});
