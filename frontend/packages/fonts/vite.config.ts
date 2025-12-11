import libAssetsPlugin from '@laynezh/vite-plugin-lib-assets';
import react from '@vitejs/plugin-react';
import {glob} from 'glob';
import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

import {LOCALES_WITH_INTERNATIONAL_FONTS} from './src/constants';

/**
 * Gets all the locale specific font configuration as entrypoints
 */
const localizedEntryPoints = glob.sync('./src/locales/**/index.module.scss', {
  posix: true,
});

const brandEntryPoints = glob.sync('./src/brands/**/index.scss', {
  posix: true,
});

/**
 * Changes .module.css/.scss files to index.css under each component folder
 * This is to indicate that upstream bundlers should not re-modularize the CSS.
 * @returns Asset file name
 */
function getAssetFileNames() {
  return '[name]/[name].[ext]';
}

/**
 * Get Rollup output configuration.
 * @param format es or cjs
 * @returns Rollup output configuration
 */
function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'auto',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].js',
    preserveModules: true,
    preserveModulesRoot: 'src',
    assetFileNames: getAssetFileNames,
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Enable React support
    react(),
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: false, // Disable rolling up types to a single file
      entryRoot: 'src',
      insertTypesEntry: false, // Prevent inserting a single types entry
      exclude: ['**/__tests__/**', '**/*.test.tsx'],
    }),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
    externalizeDeps({
      include: LOCALES_WITH_INTERNATIONAL_FONTS.map(
        locale => `@code-dot-org/fonts/locales/${locale}/index.module.css`,
      ),
    }),
    libAssetsPlugin(),
  ],
  resolve: {
    alias: [
      {
        // Workaround to emulate behavior of ~ prefix in Wepback that refers to a relative path in node_modules folder
        find: /~(.+)/,
        replacement: `${process.cwd()}/../../node_modules/$1`,
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    assetsInlineLimit: 0,
    lib: {
      entry: [
        ...localizedEntryPoints,
        ...brandEntryPoints,
        './src/index.ts',
        './src/loader/index.ts',
        './src/react/FontLoader/index.tsx',
      ],
      name: 'fonts',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
