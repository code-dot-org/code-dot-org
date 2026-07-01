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
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Inject each CSS module's styles into the JS bundle, so consumers get the
    // markdown styles automatically on import — without this, the built JS only
    // references the (hashed) class names and the emitted `.css` files are never
    // loaded, so nothing is styled in the host app.
    //
    // `relativeCSSInjection: true` is required for this `preserveModules` build:
    // it injects each chunk's CSS alongside the module that imports it, rather
    // than concatenating everything onto one entry chunk. Prepending (not
    // appending) the <style> keeps these shared styles at low precedence so a
    // host/lab can override them.
    cssInjectedByJsPlugin({
      relativeCSSInjection: true,
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
      exclude: ['**/__tests__/**', '**/*.test.tsx', 'demo/**'],
    }),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
    externalizeDeps(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@code-dot-org/markdown': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: ['src/index.ts'],
      name: 'markdown',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
