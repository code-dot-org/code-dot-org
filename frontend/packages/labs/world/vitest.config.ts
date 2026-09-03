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
    // Longer than the ten seconds vitest allows by default, because one test
    // needs it: `__tests__/App.test.tsx` mounts the whole lab shell — the
    // host, a query client, the layout, the editors — and tearing that down
    // takes a while. Alone it finishes well inside the default; with two
    // hundred and sixty other files competing for the machine it does not,
    // and vitest kills the worker mid-teardown.
    //
    // What that looks like is worth writing down, because it is not what it
    // says: the run reports "Worker exited unexpectedly" as an unhandled
    // ERROR, every test passes, and the file count is one short — so the
    // suite is green and a file silently did not run. A number is a cheaper
    // fix than a flake that can hide a real failure.
    teardownTimeout: 30_000,
    // `spikes/**` holds throwaway investigations that write files and take
    // seconds; they are run by hand, by path, and are not the suite.
    exclude: [
      'node_modules/**',
      'dist/**',
      'spikes/**',
      // Build steps wearing tests' names (`vitest.record.config.ts`): they
      // write into `public/` and must not run with the suite. The files
      // themselves, not their directories — the strip renderer beside one and
      // the stage beside the other are ordinary code with ordinary tests.
      'src/rules/demos/record/recordRuleDemos.test.ts',
      'src/actors/demos/record/recordActorDemos.test.ts',
    ],
  },
});
