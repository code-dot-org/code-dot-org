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
    // Radium (used by oceans-lab) references `global` in its CSS vendor-prefix
    // plugin; shim it to globalThis so the browser context doesn't throw.
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
      alias: {
        '@': path.resolve(__dirname, './src'),
        // Stub out react-dom/server to prevent Node-only imports (util, process)
        // from crashing in the browser. intro.js-react imports renderToStaticMarkup
        // at the top level which pulls in the full Node SSR bundle.
        'react-dom/server': path.resolve(
          __dirname,
          './src/stubs/react-dom-server.ts',
        ),
        react: path.resolve(
          searchForWorkspaceRoot(process.cwd()),
          'node_modules/react',
        ),
        'react-dom': path.resolve(
          searchForWorkspaceRoot(process.cwd()),
          'node_modules/react-dom',
        ),
      },
      // Dedupe libraries that hold module-scoped singletons. Without this
      // vite resolves them per-package: blockly's main workspace, redux's
      // store, and tfjs's backend registry all stop seeing each other.
      //
      // @tensorflow/tfjs in particular: the backend (tfjs-backend-webgl)
      // registers ops on tfjs-core's singleton. Magenta (music-lab dep)
      // ships its own copy of @tensorflow/tfjs, so without dedupe oceans-lab
      // ends up running model ops against a core instance that has no
      // backend → `runKernel` throws "t is not a function".
      dedupe: [
        'blockly',
        'react',
        'react-dom',
        'react/jsx-runtime',
        'react/jsx-dev-runtime',
        'react-redux',
        '@reduxjs/toolkit',
        '@code-dot-org/core',
        '@code-dot-org/core/api',
        '@code-dot-org/redux',
        '@tensorflow/tfjs',
        '@tensorflow/tfjs-core',
        '@tensorflow/tfjs-backend-cpu',
        '@tensorflow/tfjs-backend-webgl',
        '@tensorflow/tfjs-layers',
        '@tensorflow/tfjs-converter',
        '@tensorflow/tfjs-data',
      ],
    },
    optimizeDeps: {
      // Pre-bundle deps with CJS exports or sub-paths so the dedupe above
      // sees one resolved module per package across all workspace consumers.
      include: [
        'blockly',
        'blockly/core',
        'blockly/blocks',
        'blockly/javascript',
        'react',
        'react-dom',
        '@tensorflow/tfjs',
        '@tensorflow/tfjs-core',
        '@tensorflow/tfjs-backend-cpu',
        '@tensorflow/tfjs-backend-webgl',
        '@tensorflow/tfjs-layers',
        '@tensorflow/tfjs-converter',
      ],
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
