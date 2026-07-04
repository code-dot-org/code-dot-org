import react from '@vitejs/plugin-react';
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
    react(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: false,
      entryRoot: 'src',
      insertTypesEntry: false,
      exclude: ['**/__tests__/**', '**/*.test.tsx'],
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
      // Object-form entry so the mocks chunk emits at dist/mocks/index.* — the
      // `./mocks` export subpath resolves to it.
      entry: {
        index: 'src/index.ts',
        'mocks/index': 'src/mocks/index.ts',
      },
      name: 'teacher-dashboard',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
