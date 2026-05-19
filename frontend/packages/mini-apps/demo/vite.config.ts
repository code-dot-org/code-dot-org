import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

export default defineConfig({
  plugins: [
    react(),
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Inject `import './index.css'` into the JS entry so consumers
    // (apps) pull in the bundled CSS as a side effect of importing
    // the package. Demo has no SCSS today, but the plugin is wired
    // in advance so adding a component-library import later doesn't
    // silently lose its styles. See the parent README for context.
    libInjectCss(),
    // Externalize dependencies so they're not bundled into dist —
    // apps provides the single instance of MUI/component-library at
    // runtime. Anything in `dependencies` or `peerDependencies` is
    // externalized; anything in `devDependencies` is bundled.
    externalizeDeps(),
  ],
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: 'demo-mini-app',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [
        {
          format: 'es',
          entryFileNames: '[name].mjs',
          preserveModules: false,
          dir: 'dist',
          exports: 'named',
        },
        {
          format: 'cjs',
          entryFileNames: '[name].cjs',
          preserveModules: false,
          dir: 'dist',
          exports: 'named',
          // Unwrap `.default` when requiring externalized ESM
          // packages (component-library, MUI, etc.). Without this,
          // CJS consumers (apps's webpack via the `require` entry of
          // the exports map) get the namespace object instead of the
          // default-exported component and React fails with
          // "type is invalid -- got: object".
          interop: 'auto',
        },
      ],
    },
  },
});
