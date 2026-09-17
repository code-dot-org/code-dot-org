import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// Library build, app-shaped (see docs/conventions/packages.md). React, MUI, the
// design system, and TanStack Query stay external — the Studio host provides
// them so the lazy chunk shares one React/QueryClient instance.
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.app.json',
      entryRoot: 'src',
      exclude: ['**/__tests__/**', '**/*.test.ts', '**/*.test.tsx', 'e2e/**'],
    }),
    externalizeDeps(),
  ],
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
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
});
