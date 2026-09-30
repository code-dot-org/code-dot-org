import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
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
  },
  build: {
    lib: {
      // Object-form entry so the fixtures and sprites chunks emit at
      // dist/fixtures/index.* and dist/sprites/index.*, which the `./mocks`
      // and `./sprites` export subpaths resolve to.
      entry: {
        index: 'src/index.ts',
        'fixtures/index': 'src/fixtures/index.ts',
        'sprites/index': 'src/sprites/index.ts',
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
