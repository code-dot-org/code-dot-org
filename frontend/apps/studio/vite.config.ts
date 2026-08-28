import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot} from 'vite';
import ViteRails from 'vite-plugin-rails';
import path from 'node:path';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const isDev = mode === 'development';

  return {
    build: {
      outDir: 'dist',
    },
    // TFJS (bundled via @code-dot-org/oceans-lab) references bare `global`
    // in its browser entry; shim it to globalThis so the browser context
    // doesn't throw at module-init time.
    define: {
      global: 'globalThis',
    },
    server: {
      allowedHosts: isDev ? ['localhost-studio.code.org'] : undefined,
      fs: {
        // Allow serving files from the workspace root for monorepo setups
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
      proxy: {
        // Author Mode prototype: the local authoring service (drafts, embedded
        // agent, SSE). Same-origin via proxy so no CORS and SSE stays simple.
        '/authoring-api': {
          target: process.env.AUTHORING_API_TARGET || 'http://localhost:3737',
          rewrite: p => p.replace(/^\/authoring-api/, '/api'),
        },
        // primeCsrfToken.ts's CSRF-priming fetch calls this rails route
        // root-relative. Same-origin via proxy for the same reason as
        // /authoring-api above — see packages/lesson-deep-dive's
        // vite.config.ts for the identical pattern against the same rails
        // host. No changeOrigin: rails checks Origin against Host, and a
        // rewritten Host makes every write a 422.
        //
        // fetchAuthOutcome.ts's GET /api/v1/users/current is NOT proxyable
        // this way: it goes through DashboardApiClient, whose 'development'
        // base URL (getDashboardApiUrl.ts) is the absolute
        // http://localhost-studio.code.org:3000 by design, not a
        // root-relative path — the request never touches this dev server,
        // so no proxy entry here can intercept it. That call still CORS-
        // fails against a local rails without :3036 in its CORS allow-list;
        // fixing it needs a rails-side CORS change or a studio-specific
        // environment override in @code-dot-org/core, both bigger than
        // this pass's scope.
        '/get_token': {target: 'http://localhost-studio.code.org:3000'},
      },
    },
    resolve: {
      // Force single copies of packages that must be singletons in a monorepo.
      // Without this, Vite resolves @mui/material separately for studio source
      // files and component-library dist files (which externalize their deps),
      // producing two ThemeContext instances and breaking CDO theme overrides.
      dedupe: ['@mui/material', '@emotion/react', '@emotion/styled'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      ViteRails(),
      // https://tanstack.com/router/latest/docs/framework/react/installation/with-vite
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
    ],
  };
});
