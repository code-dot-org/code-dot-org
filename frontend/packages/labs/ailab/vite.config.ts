import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

const DATASETS_SRC = path.resolve(__dirname, 'public/datasets');

// The dataset CSV/JSON files (and their thumbnail JPGs) are NOT imported as
// modules — they are fetched at runtime from `<assetPath>datasets/<file>`,
// where the consumer sets `<assetPath>` via `setAssetPath(...)` (dashboard
// points it at `/blockly/media/skins/ailab/`). So they must land in the build
// output as plain files for the consumer to serve. Emit them under
// `dist/assets/datasets/`; the dashboard Gruntfile copies `dist/assets/**`
// into `media/skins/ailab/`, yielding `…/skins/ailab/datasets/<file>`.
function emitDatasets(): Plugin {
  return {
    name: 'emit-datasets',
    generateBundle() {
      for (const name of fs.readdirSync(DATASETS_SRC)) {
        this.emitFile({
          type: 'asset',
          fileName: `assets/datasets/${name}`,
          source: fs.readFileSync(path.join(DATASETS_SRC, name)),
        });
      }
    },
  };
}

// In dev there is no consumer to serve the datasets, and `publicDir` is off
// (see below), so the standalone host page (setAssetPathDev seeds `./`) would
// 404 on `/datasets/*`. Serve them straight off disk during `vite` / `vite
// preview`, mirroring the production layout.
function devDatasets(): Plugin {
  return {
    name: 'dev-datasets',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const prefix = '/datasets/';
        if (req.url?.startsWith(prefix)) {
          const file = path.join(DATASETS_SRC, req.url.slice(prefix.length));
          if (fs.existsSync(file)) {
            req.url = `/@fs${file}`;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  // The lab reads/writes the asset-path global as `global.__ml_playground…`;
  // shim `global` to the browser global object.
  define: {
    global: 'globalThis',
  },
  // Disable Vite's public-directory handling. `public/` here holds the
  // runtime-fetched datasets (emitted explicitly above, served in dev by the
  // middleware above) and the five small UI images, which ARE imported as
  // modules via the `@public` alias and get inlined into the bundle. Leaving
  // `publicDir` on would (a) warn on those module imports and (b) copy the
  // ~12 MB datasets tree wholesale into `dist/`.
  publicDir: false,
  plugins: [
    react(),
    emitDatasets(),
    devDatasets(),
    // Emit `.d.ts` from the library entry.
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Externalize peerDependencies only (react, react-dom, redux, react-redux,
    // lodash) so the consumer's single instances are used at runtime; bundle
    // everything else (chart.js, ml-knn, papaparse, messageformat, …).
    externalizeDeps({deps: false}),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@public': path.resolve(__dirname, './public'),
    },
  },
  build: {
    // Library mode inlines imported assets as data URIs (it cannot know the
    // deploy base URL). The five UI images are small, so this is exactly what
    // we want — they ride along in the JS with no runtime path dependency.
    lib: {
      entry: ['src/index.tsx'],
      name: 'ailab',
      formats: ['es', 'cjs'],
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
