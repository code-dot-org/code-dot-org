import {devices, expect, test as base} from 'playwright/test';

import {withApplitoolsCheck} from './applitools';
import {withPlaywrightCheck} from './playwright';
import type {VisualCheck, VisualTestConfig} from './types';

/** Backend selector: 'applitools' in the CI eyes job, 'playwright' otherwise. */
const PROVIDER = (process.env.VISUAL_PROVIDER ?? 'playwright') as
  | 'playwright'
  | 'applitools';

/**
 * Build a Playwright `test` extended with a provider-agnostic `visualCheck`
 * fixture, plus the matching `expect`. The backend (native Playwright
 * screenshots locally, Applitools Eyes in CI) is selected by VISUAL_PROVIDER;
 * `appName` labels the consumer's Eyes application.
 *
 * @example
 *   export const {test, expect} = createVisualTest({appName: 'Code.org Foo'});
 */
export function createVisualTest(config: VisualTestConfig) {
  const test = base.extend<{visualCheck: VisualCheck}>({
    visualCheck: async ({page}, use, testInfo) => {
      if (PROVIDER === 'applitools') {
        await withApplitoolsCheck(page, testInfo, use, config.appName);
      } else {
        await withPlaywrightCheck(page, testInfo, use);
      }
    },
  });

  return {test, expect};
}

/** Browsers that the visual projects can target. */
type VisualBrowser = 'chromium' | 'firefox' | 'webkit';

const DEVICE_BY_BROWSER: Record<VisualBrowser, string> = {
  chromium: 'Desktop Chrome',
  firefox: 'Desktop Firefox',
  webkit: 'Desktop Safari',
};

/**
 * Playwright `projects` for the `@visual` tests, to be spread into a config's
 * `projects` array. Returns `[]` unless VISUAL_PROVIDER is set, so `playwright
 * test` (no args) never runs them. Defaults to chromium-only — each browser is
 * a separate Eyes checkpoint (and cost), so widening is an explicit choice.
 *
 * @example
 *   projects: [
 *     {name: 'chromium', use: {...devices['Desktop Chrome']}, grepInvert: /@visual/},
 *     ...visualProjects(),
 *   ]
 */
export function visualProjects(options: {browsers?: VisualBrowser[]} = {}) {
  if (!process.env.VISUAL_PROVIDER) {
    return [];
  }
  const browsers = options.browsers ?? ['chromium'];
  return browsers.map(browser => ({
    name: `visual-${browser}`,
    use: {...devices[DEVICE_BY_BROWSER[browser]]},
    grep: /@visual/,
    retries: 0,
    fullyParallel: false,
    snapshotPathTemplate:
      '{testDir}/tmp/baselines/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  }));
}

export {expect};
export type {VisualCheck, VisualCheckOptions, VisualTestConfig} from './types';
