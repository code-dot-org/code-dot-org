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
