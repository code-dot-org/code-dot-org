import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

export default defineConfig({
  plugins: [
    react({}),
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    externalizeDeps(),
  ],
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'build-lab',
    },
    rollupOptions: {
      output: [
        {format: 'es', entryFileNames: '[name].mjs', dir: 'dist'},
        {format: 'cjs', entryFileNames: '[name].cjs', dir: 'dist'},
      ],
    },
  },
});
