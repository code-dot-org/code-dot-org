import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@cdo/locale': path.resolve(__dirname, 'src/devhost/locale.ts'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // Unit/component tests live in src; e2e/ is Playwright's (own runner).
    // *Test.tsx matches files moved from apps/ (jest convention).
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/*Test.{ts,tsx}'],
  },
});
