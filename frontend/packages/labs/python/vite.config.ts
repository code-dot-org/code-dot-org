import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

export default defineConfig({
  plugins: [
    react(),
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    externalizeDeps(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: {index: 'src/index.ts'},
      name: 'python-lab',
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
