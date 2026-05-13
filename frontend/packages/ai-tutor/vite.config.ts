import path from 'path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// Mirrors the lab packages' vite config: library mode, CSS inlined into the
// JS bundle (so consumers don't need a separate `.css` import), and React
// externalized as a peer dep.
export default defineConfig({
  plugins: [
    react(),
    dts({tsconfigPath: './tsconfig.json'}),
    cssInjectedByJsPlugin(),
    externalizeDeps({
      useFile: path.resolve(__dirname, 'package.json'),
    }),
  ],
  resolve: {
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: 'ai-tutor',
      formats: ['es', 'cjs'],
    },
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
