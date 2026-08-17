import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
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
    // Externalize only what the host application is expected to provide;
    // bundle the markdown-processing ecosystem (unified/rehype/remark/hast/...)
    // into dist so this package is self-contained. The legacy apps/ bundle
    // still depends on much older, incompatible majors of that ecosystem
    // (unified 9 vs 11, rehype-raw 5 vs 7, ...); bundling ours keeps the two
    // dependency graphs from colliding when this package is portal-linked into
    // apps/ (see apps/package.json `resolutions`).
    externalizeDeps({
      // Don't externalize `dependencies` — only component-library/core live
      // there now, re-added to `external` via `include` below. The bundled
      // markdown-processing ecosystem lives in `devDependencies` (not
      // externalized by default), so it gets pulled into dist. Keeping it out
      // of `dependencies` is what stops it leaking onto the host.
      deps: false,
      // react / react-dom / @mui / @emotion / classnames stay external and are
      // provided by the host as peers.
      peerDeps: true,
      include: [
        // component-library and core are shared singletons: they must resolve
        // to the host's single instance (a bundled duplicate would mean two
        // React contexts / two MUI registries), so keep them external. apps/
        // provides them via its own portal deps.
        /^@code-dot-org\/component-library(?:\/.*)?$/,
        /^@code-dot-org\/core(?:\/.*)?$/,
      ],
    }),
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
