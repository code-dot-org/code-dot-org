import react from '@vitejs/plugin-react';
import path from 'node:path';
import type {OutputOptions} from 'rollup';
import type {Alias} from 'vite';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

const repoRoot = path.resolve(__dirname, '../../..');
const stubs = path.resolve(__dirname, 'src/dev/stubs');

// The dev shell renders the feature straight out of apps/src. Vite tries
// aliases in array order, so the stubbed modules must precede the broad
// `@cdo/apps/*` rule. Everything else resolves to the real apps file; each
// stub records why its module cannot run outside the webpack bundle.
const devHostAliases: Alias[] = [
  {find: '@cdo/apps/util/experiments', replacement: `${stubs}/experiments.ts`},
  {
    find: '@cdo/apps/metrics/AnalyticsReporter',
    replacement: `${stubs}/analyticsReporter.ts`,
  },
  {
    find: '@cdo/apps/lab2/views/components/AiTutorChat',
    replacement: `${stubs}/AiTutorChat.tsx`,
  },
  {find: /^@cdo\/apps\//, replacement: `${repoRoot}/apps/src/`},
  {find: /^@cdo\/static\//, replacement: `${repoRoot}/apps/static/`},
  {
    find: /^@cdo\/generated-scripts\//,
    replacement: `${repoRoot}/apps/generated-scripts/`,
  },
  {find: /^@codebridge\//, replacement: `${repoRoot}/apps/src/codebridge/`},
  // Views that have moved here are imported back by apps through the package
  // name, which the exports map answers with dist/. Point it at source so
  // editing a moved view still hot-reloads instead of needing a rebuild.
  {
    find: '@code-dot-org/lesson-deep-dive',
    replacement: path.resolve(__dirname, 'src/index.ts'),
  },
];

function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    // Set on both outputs but only meaningful for CJS, where a default import
    // of an externalized compiled-ESM dep would otherwise resolve to its
    // namespace object rather than the component. Remove once the CJS output
    // goes away -- i.e. once `apps` resolves the ESM condition.
    interop: 'auto',
    exports: 'auto',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
  };
}

// https://vite.dev/config/
export default defineConfig(({command}) => ({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: false,
      entryRoot: 'src',
      insertTypesEntry: false,
      exclude: ['**/__tests__/**', '**/*.test.tsx', 'src/dev/**'],
    }),
    libInjectCss(),
    externalizeDeps(),
  ],
  resolve: {
    alias: [
      ...(command === 'serve' ? devHostAliases : []),
      {find: '@', replacement: path.resolve(__dirname, './src')},
    ],
    // apps/node_modules and frontend/node_modules hold physically distinct
    // copies of react 18.3.1. Two copies on one page is "Invalid hook call".
    dedupe: [
      'react',
      'react-dom',
      'react-redux',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  css: {
    preprocessorOptions: {
      // apps SCSS does bare `@import 'color'`. webpack resolves those through
      // sassOptions.includePaths (apps/webpack.config.js).
      scss: {loadPaths: [path.resolve(repoRoot, 'shared/css')]},
    },
  },
  server: {
    // The dev shell imports source from apps/, outside this package's root.
    fs: {allow: [repoRoot]},
  },
  // public/ holds the MSW service worker, which only the dev shell needs.
  // Keeping it out of build mode leaves the published dist/ untouched.
  publicDir: command === 'serve' ? 'public' : false,
  build: {
    sourcemap: true,
    lib: {
      entry: ['src/index.ts'],
      name: 'lesson-deep-dive',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
}));
