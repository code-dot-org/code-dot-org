import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

export default defineConfig({
  plugins: [
    react(),
    // Generate TypeScript declaration files from tsconfig.app.json.
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Externalize peerDependencies + workspace deps; keep own code bundled.
    externalizeDeps(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      // Object-form entries so the redux chunk emits at dist/redux/index.*
      // alongside the main dist/index.* — the `./redux` export subpath
      // resolves to the former.
      entry: {
        index: 'src/index.ts',
        'redux/index': 'src/redux/index.ts',
      },
      name: 'codebridge',
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
