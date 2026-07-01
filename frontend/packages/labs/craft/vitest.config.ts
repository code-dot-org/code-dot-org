import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['test/**/*Test.{js,ts}'],
    exclude: ['node_modules/**', 'dist/**'],
  },
});
