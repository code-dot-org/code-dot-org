import {defineConfig} from 'vite';

// Dev-server config for the standalone demo (`demo/`). Distinct from the
// library build in vite.config.ts: it serves the demo page, which imports the
// element from source, rather than bundling the package.
export default defineConfig({
  root: 'demo',
});
