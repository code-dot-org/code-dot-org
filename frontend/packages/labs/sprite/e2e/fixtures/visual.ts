import {createVisualTest} from '@code-dot-org/playwright-support/visual';

/** Sprite `test`/`expect` with the shared visualCheck fixture. */
export const {test, expect} = createVisualTest({
  appName: 'Code.org Sprite Lab',
});
export type {
  VisualCheck,
  VisualCheckOptions,
} from '@code-dot-org/playwright-support/visual';
