import {mergeConfig} from 'vitest/config';

import base from '@code-dot-org/lint-config/vitest/react.mjs';

export default mergeConfig(base, {
  test: {setupFiles: ['./src/__tests__/setup.ts']},
});
