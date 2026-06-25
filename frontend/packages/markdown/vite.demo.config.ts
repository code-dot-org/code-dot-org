import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// Dev-server config for the standalone demo (`demo/`). Distinct from the
// library build in vite.config.ts: it serves the demo app (imports the
// component from source for HMR) rather than bundling the package.
export default defineConfig({
  root: 'demo',
  plugins: [react()],
});
