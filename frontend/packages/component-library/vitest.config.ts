import path from 'node:path';
import {defineConfig, mergeConfig} from 'vitest/config';

import baseConfig from '@code-dot-org/lint-config/vitest/react.mjs';

export default mergeConfig(
  baseConfig,
  defineConfig({
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      setupFiles: ['./src/setupTests.ts'],
      css: {
        modules: {
          // Transitional: a few DSCO tests assert on un-hashed CSS-module
          // class names (e.g. CustomDropdown.test.tsx → 'open', 'hasError';
          // Facade.test.tsx → 'facade'). 'non-scoped' yields the original
          // class name, matching what jest's identity-obj-proxy produced.
          // Drop this block once those components migrate off CSS modules
          // to MUI/Emotion.
          classNameStrategy: 'non-scoped',
        },
      },
    },
  }),
);
