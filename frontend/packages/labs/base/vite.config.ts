import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

import {stripModuleFromCssName} from './vite/cssAssetNames';

/**
 * Get Rollup output configuration.
 * @param format es or cjs
 * @returns Rollup output configuration
 */
function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'named',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].js',
    preserveModules: true,
    preserveModulesRoot: 'src',
    assetFileNames: stripModuleFromCssName,
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Emit each chunk's CSS as a real `.css` file and inject an `import` for it
    // at the top of that chunk's JS, so consumers get the styles just by
    // importing the module — the host bundler owns when/how the CSS loads.
    // `sideEffects: ["**/*.css"]` in package.json keeps those imports from being
    // tree-shaken. Matches the markdown package's setup.
    //
    // CSS precedence follows module order: a dependency's CSS imports execute
    // before its dependents', so base (framework) styles load before a lab's and
    // sit at lower precedence — letting the lab override them. (This replaces the
    // previous `vite-plugin-css-injected-by-js` head-prepend hack.)
    libInjectCss(),
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: false, // Disable rolling up types to a single file
      entryRoot: 'src',
      insertTypesEntry: false, // Prevent inserting a single types entry
      exclude: ['**/__tests__/**', '**/*.test.tsx'],
    }),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
    externalizeDeps({
      useFile: path.resolve(__dirname, 'package.json'),
    }),
  ],
  resolve: {
    dedupe: [
      'blockly',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-redux',
      '@reduxjs/toolkit',
    ],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: [
        // The host shell (Studio / apps only — see lint-config/eslint/lab.mjs).
        'src/host.ts',
        'src/metrics.ts',
        'src/index.ts',
        'src/types.ts',
        'src/constants.ts',
        'src/dialogs/index.ts',
        'src/contexts/index.ts',
        'src/instructions/index.ts',
        'src/components/index.ts',
        'src/resourcePanel/index.ts',
        'src/hooks/index.ts',
        'src/utils/index.ts',
        'src/redux/index.ts',
        'src/redux/labSlice.ts',
        'src/redux/labViewSlice.ts',
        'src/redux/labSystemSlice.ts',
        'src/redux/labProjectSlice.ts',
        'src/redux/predictLevelSlice.ts',
        'src/interpreter/index.ts',
      ],
      name: 'lab',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
