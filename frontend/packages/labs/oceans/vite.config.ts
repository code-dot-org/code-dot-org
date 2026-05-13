import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// In library build mode Vite cannot determine the deployment base URL, so
// ?url imports get inlined as data URIs. TFJS cannot resolve the .bin weight
// file relative to a data URI, so we emit both model files explicitly via a
// Rollup plugin and reference them at runtime via import.meta.url.
function emitModelAssets(): Plugin {
  return {
    name: 'emit-model-assets',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'assets/models/model.json',
        source: fs.readFileSync(
          path.resolve(__dirname, 'src/oceans/model.json'),
          'utf-8',
        ),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'assets/models/group1-shard1of1.bin',
        source: fs.readFileSync(
          path.resolve(__dirname, 'src/oceans/group1-shard1of1.bin'),
        ),
      });
    },
  };
}

// In dev mode OceanObject.ts resolves model files via import.meta.url as
// src/oceans/assets/models/{file}, but the source files live one level up at
// src/oceans/{file}. Redirect those requests to the actual source location so
// TFJS can fetch the model without a build step.
function devModelAssets(): Plugin {
  return {
    name: 'dev-model-assets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const prefix = '/src/oceans/assets/models/';
        if (req.url?.startsWith(prefix)) {
          const filename = req.url.slice(prefix.length).split('?')[0];
          req.url = `/src/oceans/${filename}`;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  // Some bundled deps (TFJS, etc.) reference `global`; shim it for the browser.
  define: {
    global: 'globalThis',
  },
  plugins: [
    react(),
    emitModelAssets(),
    devModelAssets(),
    // Generate TypeScript declaration files from tsconfig.app.json.
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Externalize peerDependencies only — TFJS and other runtime deps stay bundled.
    externalizeDeps({deps: false}),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: 'oceans-lab',
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs',
          preserveModules: false,
          exports: 'named',
          dir: 'dist',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: false,
          exports: 'named',
          dir: 'dist',
        },
      ],
    },
  },
});
