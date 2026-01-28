import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot} from 'vite';
import ViteRails from 'vite-plugin-rails';
import path from 'node:path';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

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
      // Dedupe blockly to ensure only one instance across all workspace packages.
      // Combined with optimizeDeps.include, this ensures proper deduplication.
      dedupe: [
        'blockly',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-redux',
        '@reduxjs/toolkit',
        '@code-dot-org/redux',
      ],
    },
    optimizeDeps: {
      // Include blockly and its subpaths in pre-bundling to handle CJS-to-ESM conversion.
      // Combined with resolve.dedupe, this ensures a single instance.
      include: [
        'blockly',
        'blockly/core',
        'blockly/blocks',
        'blockly/javascript',
        'react',
        'react-dom',
      ],
    },
    plugins: [
      ViteRails(),
      // https://tanstack.com/router/latest/docs/framework/react/installation/with-vite
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react({
        babel: {
          plugins: [['babel-plugin-react-compiler']],
        },
      }),
    ],
  };
});
