import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

import {cdoResolverPlugin} from './src/devhost/cdoResolverPlugin';

// Library build, app-shaped (see docs/conventions/packages.md). React, MUI, the
// design system, and TanStack Query stay external — the Studio host provides
// them so the lazy chunk shares one React/QueryClient instance.
// https://vite.dev/config/
export default defineConfig(({command}) => ({
  plugins: [
    react(),
    // In serve mode (yarn dev), resolve @cdo/* imports to local stubs so the
    // standalone dev host renders without apps/. In build mode (library), the
    // externalizeDeps plugin keeps them external for the Studio host.
    ...(command === 'serve' ? [cdoResolverPlugin()] : []),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', 'e2e/**'],
    }),
    externalizeDeps({
      include: [/^@cdo\//, 'jquery', 'prop-types'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'home/index': 'src/home/index.ts',
        'redux/index': 'src/redux/index.ts',
        'mocks/index': 'src/mocks/index.ts',
      },
      name: 'teacherDashboard',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs',
          preserveModules: false,
          dir: 'dist',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: false,
          dir: 'dist',
        },
      ],
    },
  },
}));
