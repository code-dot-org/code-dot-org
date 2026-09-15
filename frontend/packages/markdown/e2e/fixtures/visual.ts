import {createVisualTest} from '@code-dot-org/playwright-support/visual';

/** Markdown demo `test`/`expect` with the shared provider-agnostic visualCheck. */
export const {test, expect} = createVisualTest({appName: 'Code.org Markdown'});
export type {
  VisualCheck,
  VisualCheckOptions,
} from '@code-dot-org/playwright-support/visual';
