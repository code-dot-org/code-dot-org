import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';
import ViteRails from 'vite-plugin-rails';
import path from 'node:path';
import fs from 'node:fs';
import {tanstackRouter} from '@tanstack/router-plugin/vite';

// https://vite.dev/config/
export default defineConfig(({mode}) => {
  const isDev = mode === 'development';
  // Capacitor serves the WebView at `https://localhost/` (no path prefix),
  // so the Rails-style `/frontend-studio/` base bakes broken asset URLs
  // into the bundled index.html. For Capacitor builds, drop the Rails
  // plugin entirely (its `config()` hook unconditionally sets `base` from
  // vite.json's publicOutputDir, beating both userConfig and CLI flags),
  // and let vite's own `--base=./` take effect for the relative paths.
  const isCapacitorBuild = process.env.CAPACITOR_BUILD === '1';

  return {
    build: {
      outDir: 'dist',
      // Emit `index.html` alongside the Rails-style entrypoint bundle so the
      // single build is consumable both ways:
      //   - Rails picks JS/CSS from `dist/<publicOutputDir>/assets/*` via the
      //     vite-ruby manifest.
      //   - Standalone hosts (static, Capacitor) load `dist/index.html` and
      //     follow the hashed asset references.
      // vite-plugin-ruby merges this with its own entrypoints/* inputs.
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
      },
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
    optimizeDeps: {
      // notebook-lab's pre-built dist has several unbundled external imports
      // (qrcode, @codemirror/commands, …) that are not in this workspace.
      // Excluding the package prevents Vite's import-analysis from walking
      // those imports and failing.  The dist is then served via /@fs/ URLs,
      // which also preserves the relative dynamic chunk import
      // (./index-BJSx5Ove.mjs) that esbuild would otherwise flatten.
      exclude: ['@code-dot-org/notebook-lab'],
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    plugins: [
      // Serve pyodide binaries from the notebook package's public dir during
      // dev so the notebook lab can load Pyodide without a separate static
      // server.  Only active in dev mode (apply: 'serve').
      {
        name: 'pyodide-dev-static',
        apply: 'serve' as const,
        configureServer(server) {
          const pyodideDir = path.resolve(
            __dirname,
            '../../packages/labs/notebook/public/pyodide',
          );
          // Match any URL that contains /pyodide/ regardless of prefix.
          // The worker's self.location.href picks up the Vite base path, so
          // its relative import resolves to e.g.
          // /frontend-studio/public/pyodide/pyodide.mjs rather than
          // /pyodide/pyodide.mjs.  Matching on the segment handles both.
          server.middlewares.use((req, res, next) => {
            const urlPath = (req.url ?? '').split('?')[0];
            const idx = urlPath.indexOf('/pyodide/');
            if (idx === -1) return next();
            const relPath = urlPath.slice(idx + '/pyodide'.length);
            const filePath = path.join(pyodideDir, relPath);
            fs.stat(filePath, (err, stat) => {
              if (err || !stat.isFile()) return next();
              const ext = path.extname(filePath);
              const contentType =
                ext === '.mjs' || ext === '.js'
                  ? 'application/javascript'
                  : ext === '.wasm'
                    ? 'application/wasm'
                    : ext === '.zip'
                      ? 'application/zip'
                      : ext === '.json'
                        ? 'application/json'
                        : 'application/octet-stream';
              res.setHeader('Content-Type', contentType);
              fs.createReadStream(filePath).pipe(res);
            });
          });
        },
      },
      // Serve notebook-lab's pre-built worker and split-chunk assets so they
      // are reachable in dev.  The dist embeds absolute URLs like
      // `/assets/PyodideWorker-<hash>.js`; without this middleware Vite's SPA
      // fallback returns text/html, causing a MIME-type rejection.
      {
        name: 'notebook-assets-dev-static',
        apply: 'serve' as const,
        configureServer(server) {
          const notebookAssetsDir = path.resolve(
            __dirname,
            '../../packages/labs/notebook/dist/assets',
          );
          server.middlewares.use((req, res, next) => {
            const urlPath = req.url?.split('?')[0] ?? '';
            const fileName = path.basename(urlPath);
            if (!fileName || !fileName.endsWith('.js')) return next();
            const filePath = path.join(notebookAssetsDir, fileName);
            fs.stat(filePath, (err, stat) => {
              if (err || !stat.isFile()) return next();
              res.setHeader('Content-Type', 'application/javascript');
              fs.createReadStream(filePath).pipe(res);
            });
          });
        },
      },
      // Transform .ipynb files (JSON) so Vite resolves them as ES module
      // default exports rather than failing with a syntax error.
      {
        name: 'ipynb-json',
        transform(src: string, id: string) {
          if (!id.endsWith('.ipynb')) return;
          return {code: `export default ${src}`, map: null};
        },
      },
      // Rails plugin is omitted for Capacitor builds because its `config()`
      // hook unconditionally sets `base` from vite.json's publicOutputDir
      // and beats both userConfig and the `--base` CLI flag. The mobile
      // bundle must use a relative `./` base so its index.html resolves
      // under `https://localhost/` inside Capacitor's WebView.
      //
      // TODO(FIXME): re-enable Rails-side precompressed assets.
      // `compress: false` disables the `.gz` / `.br` twin files that
      // vite-plugin-rails emits by default. We had to turn them off because
      // Android's AAPT2 asset merger treats `foo.js` and `foo.js.gz` as
      // duplicate resources (it strips known compression suffixes), which
      // fails `:app:mergeDebugAssets` during the Capacitor Android build.
      //
      // The right fix is one of:
      //   (a) keep `.gz` / `.br` in the Rails-served output and strip them
      //       from the Capacitor `webDir` before `cap sync` (e.g. a small
      //       prune script in apps/mobile that copies dist/frontend-studio
      //       into apps/mobile/www/ and drops the compressed twins);
      //   (b) emit precompressed twins to a sibling directory the Android
      //       project never sees;
      //   (c) configure AAPT2's aaptOptions { ignoreAssetsPattern } so
      //       `*.gz` / `*.br` are ignored during the asset merge, then
      //       re-enable compress here.
      //
      // Current state loses the production benefit of pre-gzipped static
      // assets served by nginx/Cloudfront; restore before going to prod.
      !isCapacitorBuild && ViteRails({compress: false}),
      // https://tanstack.com/router/latest/docs/framework/react/installation/with-vite
      tanstackRouter({
        target: 'react',
        autoCodeSplitting: true,
      }),
      react(),
      // Service worker + web manifest. Registration is gated on
      // !Capacitor.isNativePlatform() in application.tsx — WKWebView under
      // capacitor://localhost cannot reliably register SWs and a SW would
      // intercept the Capacitor bridge.
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        injectRegister: false,
        workbox: {
          // Precache only the small shell assets (HTML, CSS, fonts,
          // images). JS chunks — including the large lab chunks
          // (oceans-lab is ~3.4 MB with bundled tfjs/magenta) — are
          // hashed and get cached at runtime on first fetch. Putting
          // them in the precache would (a) explode first-visit
          // download, (b) trip vite-plugin-pwa's hard error on any
          // chunk over `maximumFileSizeToCacheInBytes`.
          globPatterns: ['**/*.{css,html,svg,png,webp,woff2}'],
          navigateFallback: 'index.html',
          navigateFallbackDenylist: [/^\/api\//, /^\/assets\//],
          cleanupOutdatedCaches: true,
          clientsClaim: true,
          skipWaiting: false,
        },
        manifest: {
          name: 'Code.org',
          short_name: 'Code.org',
          description: 'Learn computer science and AI with Code.org.',
          start_url: '/app',
          scope: '/app',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#00adbc',
          icons: [
            {
              src: '/app/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/app/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/app/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        devOptions: {enabled: false},
      }),
    ],
  };
});
