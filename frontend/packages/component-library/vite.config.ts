import react from '@vitejs/plugin-react';
import {glob} from 'glob';
import path from 'node:path';
import type {OutputOptions, PreRenderedAsset} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';
import {libInjectCss} from 'vite-plugin-lib-inject-css';

const entryPoints = glob.sync('./src/**/index.ts', {
  posix: true,
  ignore: './src/common/index.ts',
});

/**
 * Changes .module.css/.scss files to index.css under each component folder
 * This is to indicate that upstream bundlers should not re-modularize the CSS.
 * @param assetInfo Vite config asset info
 * @returns Asset file name
 */
function getAssetFileNames(assetInfo: PreRenderedAsset) {
  const name = assetInfo.names[0];

  if (/\.module\.(scss|css)$/.test(name)) {
    const componentName = path.dirname(name); // e.g., "button"
    return `${componentName}/index.css`;
  }

  return '[name]/[name].[ext]';
}

/**
 * Get Rollup output configuration.
 * @param format es or cjs
 * @returns Rollup output configuration
 */
function getRollupOutputConfig(format: 'es' | 'cjs'): OutputOptions {
  return {
    format,
    exports: 'named',
    entryFileNames: format === 'es' ? '[name].mjs' : '[name].js',
    preserveModules: true,
    preserveModulesRoot: 'src',
    assetFileNames: getAssetFileNames,
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Enable React support
    react(),
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({
      tsconfigPath: './tsconfig.app.json',
      rollupTypes: false, // Disable rolling up types to a single file
      entryRoot: 'src',
      insertTypesEntry: false, // Prevent inserting a single types entry
    }),
    // Automatically inject CSS imports for each component entrypoint
    // This allows consumers to import components without needing to separately import CSS files.
    libInjectCss(),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
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
      entry: entryPoints,
      name: 'component-library',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
