import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // jsdom supplies the DOM globals (DOMParser, document, ...) the source and
    // tests rely on; @testing-library/jest-dom adds the DOM matchers.
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
