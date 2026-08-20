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

// Dashboard route prefixes that the feature calls. Each prefix also matches
// its sub-routes (/evaluate, /unit_counts, /generate_podcast,
// /retrieve_podcast_from_s3, /:id/upload), so those are not listed.
//
// The proxy is temporary. It is necessary because apps' HttpClient sends
// root-relative URLs. When the feature moves to @code-dot-org/core's
// dashboard API client (baseUrl + CORS, as studio uses), delete this list,
// the proxy, and allowedHosts.
const dashboardProxyPrefixes = [
  '/practice_problems',
  '/user_practice_problem_attempts',
  '/challenges',
  '/challenge_responses',
  '/challenge_response_assets',
  '/user_lesson_reflections',
  '/user_lesson_objective_reflections',
  '/ai_student_podcasts',
  '/aichat_request',
  '/ai_gateway',
  '/get_token',
];

const dashboardTarget = 'http://localhost-studio.code.org:3000';

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
    ...(command === 'serve'
      ? {
          // Browse the shell on Rails' own hostname. The browser then
          // attaches the dashboard session cookie to the proxied requests.
          // Cookies ignore the port but not the host.
          allowedHosts: ['localhost-studio.code.org'],
          // Public DNS resolves that hostname to 127.0.0.1. Vite's default
          // bind ("localhost") can listen only on ::1, and then requests to
          // that hostname cannot reach the server.
          host: '127.0.0.1',
          // The proxy is always on. In msw mode, the service worker answers
          // in the page before the network, so the proxy only sees requests
          // that the fixtures do not cover.
          //
          // Do not set changeOrigin. Rails compares the Origin header with
          // request.base_url, which it derives from Host. If the proxy
          // rewrites Host to :3000, that check fails and every write returns
          // a 422.
          proxy: Object.fromEntries(
            dashboardProxyPrefixes.map(prefix => [
              prefix,
              {target: dashboardTarget},
            ]),
          ),
        }
      : {}),
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
