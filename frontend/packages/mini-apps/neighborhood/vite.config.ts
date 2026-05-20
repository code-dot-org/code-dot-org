import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Enable React support
    react(),
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Inject `import './style.css'` into the JS entry so consumers
    // (apps) pull in the bundled CSS as a side effect of importing
    // the package. Without this, the CSS file is emitted but never
    // loaded, and component styles (including the Slider's flex
    // layout) silently no-op.
    libInjectCss(),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
    externalizeDeps(),
  ],
  server: {
    allowedHosts: ['localhost-studio.code.org'],
  },
  build: {
    lib: {
      entry: ['src/index.ts'],
      name: 'neighborhood-mini-app',
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
          // `interop: 'auto'` makes rollup wrap each `require()` of an
          // externalized ESM-default-export module with an interop
          // helper that unwraps `.default`. Without this, default
          // imports from packages that emit `exports.default = ...`
          // (component-library, MUI, etc.) come back as namespace
          // objects in the CJS dist, and React renders them with
          // "type is invalid -- got: object". Webpack on the apps
          // side resolves via the `require` exports-map entry, so
          // this is the consumer the CJS dist actually serves.
          interop: 'auto',
          // Emit a single CJS chunk. Without this, canvg's internal
          // `import(...)` calls cause rollup to code-split the bundle
          // into two chunks that reference each other — apps's webpack
          // circular-dependency checker then fails the build. ESM
          // output keeps its split because no current consumer trips
          // a cycle check on it.
          inlineDynamicImports: true,
        },
      ],
    },
  },
});
