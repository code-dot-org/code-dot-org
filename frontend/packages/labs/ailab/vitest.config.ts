import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [react({jsxRuntime: 'classic'})],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*.test.{js,ts,tsx}'],
    setupFiles: ['test/setupTests.js'],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
