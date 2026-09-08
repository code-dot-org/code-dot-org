import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

// Dev-server config for the standalone demo (`demo/`). Distinct from the library
// build in vite.config.ts: it serves the demo app (importing the components from
// source for HMR) rather than bundling the package.
//
// Blockly and React are deduped so the demo, the package source, and the
// markdown dependency all share one copy of each — Blockly misbehaves with more
// than one instance, and React hooks break across duplicate copies.
export default defineConfig({
  root: 'demo',
  plugins: [react()],
  resolve: {
    dedupe: ['blockly', 'react', 'react-dom', 'react/jsx-runtime'],
  },
});
