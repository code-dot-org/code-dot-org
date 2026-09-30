import react from '@vitejs/plugin-react';
import {defineConfig, searchForWorkspaceRoot} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

import {stripModuleFromCssName} from './vite/cssAssetNames';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Each chunk imports its own CSS, so a host gets the styles by importing
    // the module; see base's vite.config.ts.
    libInjectCss(),
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
        // The fixtures' block pool.
        '../../../../dashboard/config/blocks',
      ],
    },
  },
  build: {
    cssCodeSplit: true,
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
          preserveModules: true,
          preserveModulesRoot: 'src',
          assetFileNames: stripModuleFromCssName,
          dir: 'dist',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: true,
          preserveModulesRoot: 'src',
          assetFileNames: stripModuleFromCssName,
          dir: 'dist',
        },
      ],
    },
  },
});
