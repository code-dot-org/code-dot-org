import path from 'node:path';
import type {OutputOptions} from 'rollup';
import {defineConfig} from 'vite';
import dts from 'vite-plugin-dts';
import {externalizeDeps} from 'vite-plugin-externalize-deps';

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
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    // Generate Typescript declaration files using the Vite default tsconfig
    dts({
      tsconfigPath: './tsconfig.json',
      rollupTypes: false, // Disable rolling up types to a single file
      entryRoot: 'src',
      insertTypesEntry: false, // Prevent inserting a single types entry
      exclude: ['**/__tests__/**', '**/*.test.tsx'],
    }),
    // Ensure dependencies are externalized for library build
    // Libraries such as react, react-dom, lodash, etc. should not be bundled by the library.
    // Instead, they are expected to be provided by the host application.
    externalizeDeps(),
  ],
  resolve: {
    dedupe: [
      'blockly',
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-redux',
      '@reduxjs/toolkit',
    ],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: [
        'src/index.ts',
        'src/xml/index.ts',
        'src/utils/index.ts',
        'src/events/index.ts',
        'src/contexts/index.ts',
        'src/renderers/index.ts',
        'src/renderers/thrasos/index.ts',
        'src/themes/index.ts',
        'src/themes/default/index.ts',
        'src/plugins/index.ts',
        'src/plugins/toolboxTrashcan/index.ts',
        'src/plugins/sharableProcedures/index.ts',
        'src/plugins/blockLimits/index.ts',
        'src/inputs/index.ts',
        'src/inputs/rectangle.ts',
        'src/inputs/round.ts',
        'src/inputs/triangle.ts',
        'src/fields/fieldButton/index.ts',
        'src/fields/fieldColour/index.ts',
        'src/blocks/types.ts',
      ],
      name: 'blockly-workspace',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
