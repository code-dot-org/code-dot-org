import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

/**
 * Rename emitted CSS-module assets from `*.module.css` to plain `*.css` (and
 * lib-inject-css's injected `import` follows the rename). This matters when
 * another Vite app consumes this package's `dist`: a file still named
 * `.module.css` gets the CSS-modules transform re-run and its selectors
 * re-hashed, so they no longer match the class names already baked into this
 * package's JS — leaving components unstyled (e.g. the studio app). The scoping
 * hash is applied at build time here, so the plain `.css` is self-contained.
 * Every other asset keeps the path lib-inject-css/preserveModules gave it.
 */
const stripModuleFromCssName: OutputOptions['assetFileNames'] = info => {
  const name = info.names?.[0];
  if (name?.endsWith('.module.css')) {
    return name.replace(/\.module\.css$/, '.css');
  }
  return name ?? 'assets/[name]-[hash][extname]';
};

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
    assetFileNames: stripModuleFromCssName,
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Automatically inject CSS imports for each chunk that uses styles, so
    // consumers get the markdown styles by importing the component — without
    // this, the built JS only references the (hashed) class names and the
    // emitted `.css` files are never loaded, so nothing is styled in the host
    // app. Matches the component-library setup; the consumer's bundler owns
    // when/how the CSS loads (package `sideEffects` keeps the imports from
    // being tree-shaken).
    libInjectCss(),
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
