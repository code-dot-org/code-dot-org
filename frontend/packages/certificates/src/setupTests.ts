import '@testing-library/jest-dom/vitest';

import {afterAll, afterEach, beforeAll, vi} from 'vitest';

import {server} from '../dev/msw/server';

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  configurable: true,
  value: () => null,
});

Object.defineProperty(document, 'fonts', {
  configurable: true,
  value: {
    load: vi.fn(() => Promise.resolve([])),
    ready: Promise.resolve([]),
  },
});

beforeAll(() => server.listen({onUnhandledRequest: 'error'}));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
