import react from '@vitejs/plugin-react';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  // runtimeStore.ts contains JSX syntax despite the .ts extension; include .ts
  // in the react plugin transform so esbuild parses angle-bracket syntax correctly.
  plugins: [react({include: /\.[jt]sx?$/})],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
