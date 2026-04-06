import path from 'path';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import dts from 'vite-plugin-dts';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Enable React support
    react(),
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({tsconfigPath: './tsconfig.app.json'}),
    // Inject CSS directly into JS bundle as inline styles
    // This ensures CSS is automatically loaded when the module is lazy loaded.
    cssInjectedByJsPlugin(),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
    externalizeDeps({
      useFile: path.resolve(__dirname, 'package.json'),
    }),
  ],
  resolve: {
    // Dedupe React and Redux packages to ensure only one instance is used across all packages.
    // This prevents "older version of React" errors when workspace packages
    // have different React versions in their devDependencies.
    // Also dedupe Redux packages to ensure the store singleton is shared across all packages.
    dedupe: [
      'blockly',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-redux',
      '@reduxjs/toolkit',
    ],
    // Force workspace packages with CSS to use dist files so CSS imports are resolved correctly.
    // Source files import './index.css' which doesn't exist - CSS is only generated during build.
    alias: {
      // Allow direct SCSS imports from source (must come before the general @code-dot-org/lab alias)
      '@code-dot-org/lab/styles/variables.scss': path.resolve(
        __dirname,
        '../base/src/components/layout/variables.scss',
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
  worker: {
    format: 'es',
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
        exports: 'auto',
      },
    },
  },
  server: {
    allowedHosts: ['localhost', 'localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: ['src/App.tsx'],
      name: 'maze-lab',
      formats: ['es', 'cjs'],
    },
  },
});
