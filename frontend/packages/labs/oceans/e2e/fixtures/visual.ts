import {createVisualTest} from '@code-dot-org/playwright-support/visual';

/** Oceans `test`/`expect` with the shared provider-agnostic visualCheck. */
export const {test, expect} = createVisualTest({
  appName: 'Code.org Oceans Lab',
});
export type {
  VisualCheck,
  VisualCheckOptions,
} from '@code-dot-org/playwright-support/visual';
