import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import path from 'node:path';

// Builds the header controls the Android app puts in studio.code.org pages
// (entrypoints/siteControls.tsx) as one script and one stylesheet, at fixed
// names the app's page script loads: dist/site-controls.js and .css. Run
// after `yarn build` copies studio's mobile output into dist; this adds to it.
export default defineConfig({
  publicDir: false,
  // Library builds leave process.env alone; React and MUI read NODE_ENV.
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: false,
    lib: {
      entry: path.resolve(__dirname, 'entrypoints/siteControls.tsx'),
      formats: ['iife'],
      name: 'CodeAISiteControls',
      fileName: () => 'site-controls.js',
      cssFileName: 'site-controls',
    },
  },
  resolve: {
    dedupe: ['@mui/material', '@emotion/react', '@emotion/styled'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [react()],
});
