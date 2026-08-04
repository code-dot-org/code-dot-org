import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vitest/config';

import {cdoResolverPlugin} from './src/devhost/cdoResolverPlugin';

export default defineConfig({
  plugins: [react(), cdoResolverPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    // *Test.tsx matches files ported from apps/ (jest convention).
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'src/**/*Test.{ts,tsx}'],
  },
});
