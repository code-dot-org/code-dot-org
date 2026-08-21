import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

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
      entry: ['src/index.ts'],
      name: 'aitutor',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
