// Vitest setup: jest-dom matchers.

import '@testing-library/jest-dom/vitest';

import {vi} from 'vitest';

// Shim for test files moved from apps/ that use jest.* globals.
// Vitest hoists jest.mock like vi.mock and the vi API is compatible.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;
