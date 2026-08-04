import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

import {cdoResolverPlugin} from './src/devhost/cdoResolverPlugin';

// Library build, app-shaped. React, MUI, the design system, dnd-kit, and
// xyflow stay external — the Studio host provides them. @cdo/* imports stay
// external in build mode (the host resolves them); in serve mode the
// cdoResolverPlugin maps them to dev-host stubs so the standalone dev host
// renders without apps/ or Rails.
export default defineConfig(({command}) => ({
  plugins: [
    react(),
    ...(command === 'serve' ? [cdoResolverPlugin()] : []),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx'],
    }),
    externalizeDeps({
      include: [/^@cdo\//],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: {index: 'src/index.ts'},
      name: 'lessonDeepDive',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [
        {format: 'es', entryFileNames: '[name].mjs', dir: 'dist'},
        {format: 'cjs', entryFileNames: '[name].cjs', dir: 'dist'},
      ],
    },
  },
}));
