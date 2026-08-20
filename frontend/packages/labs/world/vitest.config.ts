import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {'@': path.resolve(__dirname, './src')},
  },
  test: {
    globals: true,
    environment: 'jsdom',
    // jsdom shims the effect editor's React Flow canvas needs, plus jest-dom's
    // matchers. See the file — each shim is inert for tests that do not need it.
    setupFiles: ['./src/__tests__/setup.ts'],
    // `spikes/**` holds throwaway investigations that write files and take
    // seconds; they are run by hand, by path, and are not the suite.
    exclude: ['node_modules/**', 'dist/**', 'spikes/**'],
  },
});
