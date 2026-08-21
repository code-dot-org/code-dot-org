import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

import {tutorKeyProxy} from './src/dev/keyProxy';

function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'auto',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // The demo page's optional live transport (specs/PLAN.md §7). `apply:
    // 'serve'` on the plugin means a build never runs it, and no key in the
    // environment means it does not mount.
    tutorKeyProxy(),
    // Inject each chunk's CSS import beside the chunk that uses it. Without
    // this the built JS references hashed class names and nothing ever loads
    // the emitted `.css`, so a consumer gets an unstyled panel. Matches the
    // markdown and component-library setup; `sideEffects` in package.json is
    // what keeps those imports from being tree-shaken away.
    libInjectCss(),
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: false,
      entryRoot: 'src',
      insertTypesEntry: false,
      exclude: ['**/__tests__/**', '**/*.test.tsx', '**/demo/**'],
    }),
    externalizeDeps(),
  ],
  resolve: {
    alias: {'@': path.resolve(__dirname, './src')},
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      // Two entries: the panel, and the dev-server plugin a host's own
      // harness imports from `@code-dot-org/aitutor/dev`. The plugin is node
      // code and must never be reachable from the browser entry.
      entry: ['src/index.ts', 'src/dev/keyProxy.ts'],
      name: 'aitutor',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
