// Running the demo recorders, which are build steps wearing tests' names.
//
// They need a DOM — a rule and an actor are both Blockly JSON, and the headless
// generator is what compiles them — so vitest runs them, and this keeps them
// out of the suite: the suite must not write files into `public/`, and a build
// step must not wait for three thousand tests.
//
//   yarn build:demos

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
    include: [
      'src/rules/demos/record/recordRuleDemos.test.ts',
      'src/actors/demos/record/recordActorDemos.test.ts',
    ],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
