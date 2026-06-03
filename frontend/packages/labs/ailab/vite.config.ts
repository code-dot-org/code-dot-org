import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

const PUBLIC_DIR = path.resolve(__dirname, 'public');

// Subdirectories of `public/` whose files are fetched at runtime from
// `<assetPath><dir>/<file>` (the consumer sets `<assetPath>` via
// `setAssetPath(...)`) rather than imported into the bundle:
//   datasets/ — the CSV/JSON data and thumbnail JPGs
//   images/   — the UI sprites; these are emitted rather than inlined because
//               library mode always inlines imported assets as base-64 (it
//               ignores `assetsInlineLimit` and can't know the deploy URL),
//               which would add ~600 KB to the entry and lose separate caching
// They are emitted as plain files under `dist/assets/<dir>/`; the dashboard
// Gruntfile copies `dist/assets/**` into `media/skins/ailab/`, yielding
// `…/skins/ailab/<dir>/<file>`.
const RUNTIME_ASSET_DIRS = ['datasets', 'images'];

function emitRuntimeAssets(): Plugin {
  return {
    name: 'emit-runtime-assets',
    generateBundle() {
      const walk = (dir: string): void => {
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            walk(full);
          } else {
            this.emitFile({
              type: 'asset',
              fileName: `assets/${path.relative(PUBLIC_DIR, full)}`,
              source: fs.readFileSync(full),
            });
          }
        }
      };
      for (const dir of RUNTIME_ASSET_DIRS) {
        walk(path.join(PUBLIC_DIR, dir));
      }
    },
  };
}

// In dev there is no consumer to serve those files, and `publicDir` is off
// (see below), so the standalone host page (setAssetPathDev seeds `./`) would
// 404 on `/datasets/*` and `/images/*`. Serve them straight off disk during
// `vite` / `vite preview`, mirroring the production layout. The request path
// is decoded, resolved, and confirmed to stay under `public/` so a `../`
// request cannot escape the served roots.
function devRuntimeAssets(): Plugin {
  return {
    name: 'dev-runtime-assets',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const url = req.url ?? '';
        if (RUNTIME_ASSET_DIRS.some(dir => url.startsWith(`/${dir}/`))) {
          const rel = decodeURIComponent(url.slice(1).split('?')[0]);
          const file = path.resolve(PUBLIC_DIR, rel);
          if (file.startsWith(PUBLIC_DIR + path.sep) && fs.existsSync(file)) {
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
  // Disable Vite's public-directory handling. `public/` here holds only the
  // runtime-fetched assets (datasets + UI images), which are emitted
  // explicitly above and served in dev by the middleware above. Leaving
  // `publicDir` on would copy that ~12 MB tree wholesale into `dist/`.
  publicDir: false,
  plugins: [
    react(),
    emitRuntimeAssets(),
    devRuntimeAssets(),
    // Emit `.d.ts` from the library entry.
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Externalize peerDependencies only (react, react-dom, redux,
    // react-redux) so the consumer's single instances are used at runtime;
    // bundle everything else (chart.js, ml-knn, papaparse, messageformat, …).
    externalizeDeps({deps: false}),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
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
