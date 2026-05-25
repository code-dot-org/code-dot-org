import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, searchForWorkspaceRoot, type Plugin} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// Emit TFJS model files as real assets. In library mode ?url imports inline
// as data URIs, which TFJS can't resolve the .bin weights against.
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

// Dev-only: redirect model fetches to the unbuilt source location, since
// OceanObject.ts resolves via import.meta.url as src/oceans/assets/models/*.
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
  // Browser shim for `global` (TFJS etc. expect it).
  define: {
    global: 'globalThis',
  },
  plugins: [
    react(),
    emitModelAssets(),
    devModelAssets(),
    // Emit .d.ts files.
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Externalize peer deps only; bundle TFJS and other runtime deps.
    externalizeDeps({deps: false}),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    allowedHosts: ['localhost-studio.code.org'],
    fs: {
      // Serve files from the whole Yarn workspace so symlinked CSS url()s
      // (e.g. @code-dot-org/fonts woff2) resolve. Matches studio.
      allow: [searchForWorkspaceRoot(process.cwd())],
    },
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
