// Vitest setup: jest-dom matchers + vitest-axe a11y assertions.

import '@testing-library/jest-dom/vitest';

import {expect, vi} from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);

// Shim for test files moved from apps/ that use jest.* globals.
// Vitest's vi API is compatible for fn/spyOn/useFakeTimers/etc.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;
