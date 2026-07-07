import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

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
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: false,
      entryRoot: 'src',
      insertTypesEntry: false,
      exclude: ['**/__tests__/**', '**/*.test.ts'],
    }),
    externalizeDeps(),
  ],
  resolve: {
    alias: {'@': path.resolve(__dirname, './src')},
  },
  build: {
    sourcemap: true,
    lib: {
      // One entry per public subpath. `preserveModules` keeps the src/ layout,
      // so src/visual/index.ts emits to dist/visual/index.{mjs,cjs,d.ts}.
      entry: ['src/visual/index.ts'],
      name: 'playwrightSupport',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
