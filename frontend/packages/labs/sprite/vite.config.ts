import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    externalizeDeps(),
  ],
  server: {
    allowedHosts: ['localhost-studio.code.org'],
    fs: {
      // The engine demo runs the real NativeSpriteLab helper library.
      allow: [
        searchForWorkspaceRoot(process.cwd()),
        '../../../../dashboard/config/libraries',
      ],
    },
  },
  build: {
    lib: {
      // Object-form entry so the fixtures, sprites and engine chunks emit
      // at dist/<name>/index.*, which the `./mocks`, `./sprites` and
      // `./engine` export subpaths resolve to.
      entry: {
        index: 'src/index.ts',
        'fixtures/index': 'src/fixtures/index.ts',
        'sprites/index': 'src/sprites/index.ts',
        'engine/index': 'src/engine/index.ts',
      },
      name: 'sprite-lab',
      formats: ['es', 'cjs'],
    },
    // NOTE: We output .mjs for ESM because package.json type is not 'module'.
    // This is required for compatibility with usage in `apps`, which expects .mjs for ESM imports.
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs',
          preserveModules: false,
          dir: 'dist',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: false,
          dir: 'dist',
        },
      ],
    },
  },
});
