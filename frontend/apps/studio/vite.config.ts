import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot} from 'vite';
import ViteRails from 'vite-plugin-rails';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const isDev = mode === 'development';

  return {
    server: {
      allowedHosts: isDev ? ['localhost-studio.code.org'] : undefined,
      fs: {
        // Allow serving files from the workspace root for monorepo setups
        allow: [searchForWorkspaceRoot(process.cwd())],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      ViteRails(),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
  };
});
