import {mergeConfig} from 'vitest/config';

import base from '@code-dot-org/lint-config/vitest/react.mjs';

export default mergeConfig(base, {
  test: {
    setupFiles: ['./src/__tests__/setup.ts'],
    // Playwright e2e specs (e2e/*.spec.ts) run under `test:ui`, not Vitest.
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
});
