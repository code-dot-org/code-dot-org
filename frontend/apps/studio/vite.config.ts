import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot, type Plugin, type PluginOption} from 'vite';
import ViteRails from 'vite-plugin-rails';
import {VitePWA} from 'vite-plugin-pwa';
import fs from 'node:fs';
import path from 'node:path';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

// Oceans-lab's library build emits model.json + group1-shard1of1.bin into
// its own dist/assets/models/. When studio bundles oceans-lab as a workspace
// dep, Vite picks up model.json (referenced via import.meta.url in
// OceanObject.ts) and hashes its filename — but it does not follow the
// .bin reference inside the JSON's weightsManifest, so the .bin never
// reaches studio's dist. TF.js then fails to load the model offline.
//
// This plugin copies both files verbatim into studio's `dist/assets/models/`
// so the .bin lives next to a known-path model.json that Workbox can
// precache. We also rewrite OceanObject's runtime model URL via a separate
// runtime path (see the oceans-lab side); for now, study's offline play
// works because the precache manifest contains both files.
function emitOceansModelAssets(): Plugin {
  const oceansDir = path.resolve(
    __dirname,
    '../../packages/labs/oceans/dist/assets/models',
  );
  return {
    name: 'studio:emit-oceans-model-assets',
    apply: 'build',
    generateBundle() {
      const modelJsonPath = path.join(oceansDir, 'model.json');
      const binPath = path.join(oceansDir, 'group1-shard1of1.bin');
      if (!fs.existsSync(modelJsonPath) || !fs.existsSync(binPath)) {
        // oceans-lab hasn't been built yet. Studio's `yarn build` chain
        // ensures it does, but a dev poking at config can hit this.
        this.warn(
          'oceans-lab dist/assets/models not found; skipping model copy. Run `yarn workspace @code-dot-org/oceans-lab build` first.',
        );
        return;
      }
      this.emitFile({
        type: 'asset',
        fileName: 'assets/models/model.json',
        source: fs.readFileSync(modelJsonPath, 'utf-8'),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'assets/models/group1-shard1of1.bin',
        source: fs.readFileSync(binPath),
      });
    },
    // Rollup hashes the model.json that oceans-lab references via
    // `import.meta.url`, putting it in `assets/model-<hash>.json`. But the
    // weights .bin file referenced *inside* that JSON sits at
    // `assets/models/group1-shard1of1.bin` (no hash, our verbatim copy
    // above), so TFJS would 404 on the bin at runtime.
    //
    // Rewrite the hashed-path reference in the emitted JS chunks to point
    // at the verbatim un-hashed model.json, which has the .bin sibling.
    writeBundle(_options, bundle) {
      const outDir = (_options.dir ?? 'dist') as string;
      // The bundled construction looks like:
      //   new URL("model-<hash>.json", import.meta.url)
      // where the bundle JS sits in assets/ — so a bare "model-X.json"
      // resolves to assets/model-X.json. Rewrite to "models/model.json"
      // so it resolves to assets/models/model.json (no hash, .bin sibling).
      const re = /"model-[A-Za-z0-9_-]+\.json"/g;
      for (const file of Object.values(bundle)) {
        if (file.type !== 'chunk') continue;
        const updated = file.code.replace(re, '"models/model.json"');
        if (updated !== file.code) {
          fs.writeFileSync(path.join(outDir, file.fileName), updated);
        }
      }
    },
  };
}

// VITE_MOBILE switches the build to produce a Rails-independent bundle
// that can be served from `file://` (Capacitor) or a static host (PWA).
//
//   - base becomes './' so asset URLs are relative
//   - vite-plugin-rails is dropped (no Rails entry-point injection)
//   - vite-plugin-pwa generates the service worker + manifest precache
//
// `yarn dev` and `yarn build` (no VITE_MOBILE) keep the existing
// Rails-integrated behavior with no service worker.
export default defineConfig(({mode}) => {
  const isDev = mode === 'development';
  const isMobile = process.env.VITE_MOBILE === '1';

  const plugins: PluginOption[] = [];
  if (!isMobile) {
    plugins.push(ViteRails());
  }
  plugins.push(
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    emitOceansModelAssets(),
  );
  if (isMobile) {
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        // We register the SW manually from registerServiceWorker.ts so we can
        // gate on production builds only and surface update events.
        injectRegister: null,
        manifest: false, // served from public/manifest.webmanifest
        workbox: {
          // Precache the built shell. Glob picks up bundled JS/CSS/HTML and
          // any static assets emitted by vite.
          globPatterns: [
            '**/*.{js,css,html,svg,png,webp,woff,woff2,json,bin}',
          ],
          // The oceans-lab chunk plus TF.js can exceed the default 2 MB cap.
          maximumFileSizeToCacheInBytes: 8 * 1024 * 1024,
          // Dashboard course-offerings: stale-while-revalidate so the catalog
          // can be enriched online without blocking offline launches.
          runtimeCaching: [
            {
              urlPattern: /\/dashboardapi\/course_offerings/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'catalog-api',
                expiration: {
                  maxEntries: 4,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
                },
              },
            },
          ],
        },
      }),
    );
  }

  return {
    base: isMobile ? './' : '/',
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
      },
    },
    plugins,
  };
});
