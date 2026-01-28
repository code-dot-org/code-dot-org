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
        'src/channels/index.js',
        'src/files/index.js',
        'src/projects/index.js',
        'src/sources/index.js',
        'src/userLevels/index.js',
        'src/models/activitySections/index.js',
        'src/models/learningGoalEvidenceLevels/index.js',
        'src/models/learningGoals/index.js',
        'src/models/lessonActivities/index.js',
        'src/models/lessonGroups/index.js',
        'src/models/lessonLevels/index.js',
        'src/models/lessons/index.js',
        'src/models/lessonsOpportunityStandards/index.js',
        'src/models/lessonsProgrammingExpressions/index.js',
        'src/models/lessonsResources/index.js',
        'src/models/lessonsStandards/index.js',
        'src/models/lessonsVocabularies/index.js',
        'src/models/levelScriptLevels/index.js',
        'src/models/levels/index.js',
        'src/models/objectives/index.js',
        'src/models/resources/index.js',
        'src/models/rubrics/index.js',
        'src/models/scriptLevels/index.js',
        'src/models/scriptsResources/index.js',
        'src/models/sections/index.js',
        'src/models/units/index.js',
        'src/models/vocabularies/index.js',
      ],
      name: 'api',
    },
    rollupOptions: {
      output: [getRollupOutputConfig('es'), getRollupOutputConfig('cjs')],
    },
  },
});
