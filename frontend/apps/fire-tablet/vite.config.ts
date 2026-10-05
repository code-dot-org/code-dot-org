import {defineConfig} from 'vite';

export default defineConfig({
  base: './',
  build: {
    // Provisional target; confirm against the actual Fire device WebView.
    target: 'chrome71',
    outDir: 'dist',
  },
});
