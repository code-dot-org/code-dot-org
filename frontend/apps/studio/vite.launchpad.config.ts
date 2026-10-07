import react from '@vitejs/plugin-react';
import path from 'node:path';
import {defineConfig, searchForWorkspaceRoot} from 'vite';

export default defineConfig({
  root: path.resolve(__dirname, 'launchpad'),
  publicDir: false,
  base: './',
  plugins: [react()],
  resolve: {
    alias: {'@': path.resolve(__dirname, 'src')},
    dedupe: [
      'react',
      'react-dom',
      '@mui/material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    fs: {allow: [searchForWorkspaceRoot(process.cwd())]},
  },
  build: {
    outDir: path.resolve(__dirname, 'dist-launchpad'),
    emptyOutDir: true,
    target: ['chrome71', 'safari15'],
  },
});
