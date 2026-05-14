import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // No test files yet — don't fail the workspace test pipeline.
    passWithNoTests: true,
  },
});
