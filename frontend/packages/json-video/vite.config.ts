import react from '@vitejs/plugin-react';
import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'named',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
  };
}

// https://vite.dev/config/
export default defineConfig(({command}) => ({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: false,
      entryRoot: 'src',
      insertTypesEntry: false,
      exclude: ['src/dev/**'],
    }),
    externalizeDeps(),
  ],
  resolve: {
    alias: {'@': path.resolve(__dirname, './src')},
  },
  server: {
    // Vite's default bind can land on ::1 only; the Playwright config
    // addresses 127.0.0.1.
    host: '127.0.0.1',
  },
  // index.html and src/dev/ are the dev page; build mode is the library.
  publicDir: command === 'serve' ? 'public' : false,
  build: {
    sourcemap: true,
    lib: {
      entry: ['src/index.ts'],
      name: 'json-video',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
}));
