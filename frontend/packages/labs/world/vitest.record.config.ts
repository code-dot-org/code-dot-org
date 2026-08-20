// Running the rule-demo recorder, which is a build step wearing a test's name.
//
// It needs a DOM — the rules are Blockly JSON and the headless generator is
// what compiles them — so vitest runs it, and this keeps it out of the suite:
// the suite must not write files into `public/`, and a build step must not wait
// for two thousand tests.
//
//   yarn build:rule-demos

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
    include: ['src/rules/demos/record/recordRuleDemos.test.ts'],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
