import react from '@vitejs/plugin-react';
import path from 'path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

import {stripModuleFromCssName} from './vite/cssAssetNames';

function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'named',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].cjs',
    preserveModules: true,
    preserveModulesRoot: 'src',
    dir: 'dist',
    assetFileNames: stripModuleFromCssName,
  };
}

export default defineConfig({
  plugins: [
    react(),
    // Emit each chunk's CSS as a real `.css` file and inject an `import` for it
    // at the top of that chunk's JS, so consumers get the styles just by
    // importing the module. `sideEffects: ["**/*.css"]` keeps those imports from
    // being tree-shaken. Matches the markdown / base / music packages.
    libInjectCss(),
    // Generate TypeScript declaration files from tsconfig.app.json.
    dts({tsconfigPath: './tsconfig.app.json', entryRoot: 'src'}),
    // Externalize peerDependencies + workspace deps; keep own code bundled.
    externalizeDeps(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      // `src/redux/index.ts` is an explicit entry so it emits at
      // dist/redux/index.* — the `./redux` export subpath resolves to it.
      entry: ['src/index.ts', 'src/redux/index.ts'],
      name: 'codebridge',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
