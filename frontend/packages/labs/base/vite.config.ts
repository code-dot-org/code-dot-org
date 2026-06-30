import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

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
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Inject CSS directly into JS bundle as inline styles.
    // This ensures CSS is automatically loaded when the module is imported,
    // so consumers don't need separate CSS imports.
    //
    // Prepend (rather than append) base's <style> tags to <head> so framework
    // styles sit at the top — lowest precedence among equal-specificity CSS
    // modules — letting a lab's own styles override them. The default appends
    // at runtime per chunk, which lands base styles last (highest precedence)
    // and wrongly overrides the lab. (A `@layer`-based scheme would make this
    // order-independent; this is the lighter-weight ordering fix.)
    cssInjectedByJsPlugin({
      injectCodeFunction: cssCode => {
        try {
          if (typeof document !== 'undefined') {
            const style = document.createElement('style');
            style.appendChild(document.createTextNode(cssCode));
            document.head.prepend(style);
          }
        } catch (e) {
          console.error('vite-plugin-css-injected-by-js', e);
        }
      },
    }),
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
        'src/index.ts',
        'src/dialogs/index.ts',
        'src/contexts/index.ts',
        'src/instructions/index.ts',
        'src/components/index.ts',
        'src/resourcePanel/index.ts',
        'src/hooks/index.ts',
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
