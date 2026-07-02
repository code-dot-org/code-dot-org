import fs from 'fs';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

function emitCraftAssets(): Plugin {
  return {
    name: 'emit-craft-assets',
    generateBundle() {
      const assetsDir = path.resolve(__dirname, 'src/assets');
      const walk = (dir: string, base: string) => {
        for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
          const fullPath = path.join(dir, entry.name);
          const relPath = path.join(base, entry.name);
          if (entry.isDirectory()) {
            walk(fullPath, relPath);
          } else {
            this.emitFile({
              type: 'asset',
              fileName: `assets/${relPath}`,
              source: fs.readFileSync(fullPath),
            });
          }
        }
      };
      walk(assetsDir, '');
    },
  };
}

export default defineConfig({
  plugins: [
    emitCraftAssets(),
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // phaser is a devDependency on purpose: externalizeDeps only externalizes
    // dependencies/peerDependencies, so phaser 4 gets bundled into dist and
    // apps/ needs no new dependency (PoC packaging; revisit for the real port).
    externalizeDeps(),
  ],
  optimizeDeps: {
    include: ['phaser'],
  },
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: {
        index: 'src/index.ts',
        'fixtures/index': 'src/fixtures/index.ts',
      },
      name: 'craft-lab',
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
