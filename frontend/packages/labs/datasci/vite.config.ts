import path from 'path';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({tsconfigPath: './tsconfig.app.json'}),
    // Inject CSS directly into the JS bundle. In library mode, vite would
    // emit a separate .css file that consumers must import explicitly —
    // since studio just `lazy(() => import('@code-dot-org/datasci-lab'))`
    // without touching the CSS file, our styles never load without this.
    cssInjectedByJsPlugin(),
    externalizeDeps({
      useFile: path.resolve(__dirname, 'package.json'),
    }),
  ],
  resolve: {
    dedupe: [
      'blockly',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-redux',
      '@reduxjs/toolkit',
    ],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  css: {
    modules: {
      localsConvention: 'camelCase',
    },
  },
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: 'datasci-lab',
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
