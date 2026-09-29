import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // @code-dot-org/core/api reads window at import time.
    environment: 'jsdom',
  },
});
