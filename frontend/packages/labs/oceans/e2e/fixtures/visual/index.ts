import {test as base} from 'playwright/test';

import {withApplitoolsCheck} from './applitools';
import {withPlaywrightCheck} from './playwright';
import type {VisualCheck} from './types';

/** Backend selector: 'applitools' in CI eyes job, 'playwright' otherwise. */
const PROVIDER = (process.env.VISUAL_PROVIDER ?? 'playwright') as
  | 'playwright'
  | 'applitools';

/** Playwright test extended with a provider-agnostic `visualCheck`. */
export const test = base.extend<{visualCheck: VisualCheck}>({
  visualCheck: async ({page}, use, testInfo) => {
    if (PROVIDER === 'applitools') {
      await withApplitoolsCheck(page, testInfo, use);
    } else {
      await withPlaywrightCheck(page, testInfo, use);
    }
  },
});

export {expect} from 'playwright/test';
export type {VisualCheck, VisualCheckOptions} from './types';
