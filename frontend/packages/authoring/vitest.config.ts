import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // loadCourse's real-file integration test does one directory-wide scan
    // over dashboard/config/scripts and dashboard/config/levels/custom.
    testTimeout: 30000,
    hookTimeout: 30000,
  },
});
