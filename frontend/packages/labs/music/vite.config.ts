import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Enable React support
    react(),
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
    externalizeDeps(),
  ],
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  resolve: {
    // Dedupe React and Redux packages to ensure only one instance is used across all packages.
    // This prevents "older version of React" errors when workspace packages
    // have different React versions in their devDependencies.
    // Also dedupe Redux packages to ensure the store singleton is shared across all packages.
    // IMPORTANT: @code-dot-org/redux must be deduped to ensure the store singleton is shared
    // between @code-dot-org/redux and @code-dot-org/redux/providers subpath exports.
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-redux',
      '@reduxjs/toolkit',
      '@code-dot-org/redux',
    ],
    // Force workspace packages with CSS to use dist files so CSS imports are resolved correctly.
    // Source files import './index.css' which doesn't exist - CSS is only generated during build.
    alias: {
      '@code-dot-org/component-library': path.resolve(
        __dirname,
        '../../component-library/dist/esm',
      ),
      '@code-dot-org/blockly-workspace': path.resolve(
        __dirname,
        '../../blockly-workspace/dist/esm',
      ),
      '@code-dot-org/markdown': path.resolve(
        __dirname,
        '../../markdown/dist/esm',
      ),
    },
  },
  optimizeDeps: {
    // Force Vite to pre-bundle React from the root to ensure a single instance
    include: ['react', 'react-dom'],
  },
  css: {
    // Enable CSS modules for .module.scss files
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: 'music-lab',
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
