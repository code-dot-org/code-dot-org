import {createVisualTest} from '@code-dot-org/playwright-support/visual';

export const {test, expect} = createVisualTest({
  appName: 'Code.org Certificates',
});
export type {
  VisualCheck,
  VisualCheckOptions,
} from '@code-dot-org/playwright-support/visual';
