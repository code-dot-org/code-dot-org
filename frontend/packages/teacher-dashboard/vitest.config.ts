import {mergeConfig} from 'vitest/config';

import baseConfig from '@code-dot-org/lint-config/vitest/react.mjs';

export default mergeConfig(baseConfig, {
  test: {
    setupFiles: ['./src/__tests__/setup.ts'],
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
