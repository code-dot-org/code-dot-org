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

export default defineConfig({
  // Radium's CSS vendor-prefix plugin references `global`; shim it so the
  // browser environment doesn't throw during standalone `yarn dev`.
  define: {
    global: 'globalThis',
  },
  plugins: [
    react(),
    emitModelAssets(),
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
