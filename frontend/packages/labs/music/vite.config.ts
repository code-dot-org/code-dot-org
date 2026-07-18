import path from 'path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import dts from 'vite-plugin-dts';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

/**
 * Get Rollup output configuration.
 * @param format es or cjs
 * @returns Rollup output configuration
 */
function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'named',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Enable React support
    react(),
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({tsconfigPath: './tsconfig.app.json'}),
    // Emit each chunk's CSS as a real `.css` file and inject an `import` for it
    // at the top of that chunk's JS, so styles load automatically when a module
    // is imported — the host bundler owns when/how the CSS loads, and
    // `sideEffects: ["**/*.css"]` keeps the imports from being tree-shaken.
    // Matches the markdown package's setup (replaces the previous
    // `vite-plugin-css-injected-by-js`).
    libInjectCss(),
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
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      // `src/fixtures/index.ts` is an explicit entry so its JS is emitted to
      // dist/fixtures/index.* (the `./mocks` export subpath). Nothing in the
      // App.tsx graph imports it, so without this only its .d.ts would build.
      entry: ['src/App.tsx', 'src/fixtures/index.ts'],
      name: 'music-lab',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
