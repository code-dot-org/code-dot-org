// Vitest setup: jest-dom matchers + vitest-axe a11y assertions.

import '@testing-library/jest-dom/vitest';

import {expect} from 'vitest';
import * as axeMatchers from 'vitest-axe/matchers';

expect.extend(axeMatchers);
