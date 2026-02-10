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
    exports: 'auto',
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
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Resolve self-references to source during build
      '@code-dot-org/core/api': path.resolve(__dirname, './src/api'),
      '@code-dot-org/core/metrics': path.resolve(__dirname, './src/metrics'),
      '@code-dot-org/core/audio': path.resolve(__dirname, './src/audio'),
      '@code-dot-org/core/textToSpeech': path.resolve(
        __dirname,
        './src/textToSpeech',
      ),
      '@code-dot-org/core/redux': path.resolve(__dirname, './src/redux'),
      '@code-dot-org/core': path.resolve(__dirname, './src'),
    },
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    lib: {
      entry: [
        'src/index.ts',
        'src/api/index.ts',
        'src/metrics/index.ts',
        'src/audio/index.ts',
        'src/textToSpeech/index.ts',
        'src/redux/index.ts',
      ],
      name: 'core',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
