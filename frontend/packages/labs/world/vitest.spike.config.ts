// Running a spike, which the suite deliberately does not.
//
// `spikes/**` is excluded in `vitest.config.ts`: those are throwaway
// investigations that write files and take seconds, and they must not join the
// suite. But excluding them there also stops `vitest <path>` finding one — a
// positional filter narrows the include set, it does not widen it, and the CLI
// `--exclude` appends rather than replaces.
//
// So a spike is run through this instead:
//
//   npx vitest --run --config vitest.spike.config.ts

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
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['spikes/**/*.test.?(c|m)[jt]s?(x)'],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
