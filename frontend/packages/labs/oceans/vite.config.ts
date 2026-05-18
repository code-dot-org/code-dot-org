import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// Vite library mode forcibly inlines `new URL(import.meta.url)` and `?url`
// asset references as data URIs and ignores `build.assetsInlineLimit`
// (documented). To keep model.json and the TFJS weight shard as real
// emitted files — so downstream consumers (studio etc.) can re-emit them
// through their own asset pipelines — emit both explicitly here.
//
// (Tried @laynezh/vite-plugin-lib-assets as the canonical workaround;
// it rewrites all asset references through `?url` internally, which
// trips `@rollup/plugin-commonjs` during the CJS pass of our dual-format
// build. An explicit emit composes cleanly with both ES and CJS outputs.)
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
// src/oceans/assets/models/{file}, but the source files live one level up
// at src/oceans/{file}. Redirect those requests to the actual source
// location so TFJS can fetch the model without a build step.
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
