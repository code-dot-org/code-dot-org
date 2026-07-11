import {devices, expect, test as base, type Page} from 'playwright/test';

import {withApplitoolsCheck} from './applitools';
import {withPlaywrightCheck} from './playwright';
import type {VisualCheck, VisualTestConfig} from './types';

/** Backend selector: 'applitools' in the CI eyes job, 'playwright' otherwise. */
const PROVIDER = (process.env.VISUAL_PROVIDER ?? 'playwright') as
  | 'playwright'
  | 'applitools';

/**
 * Refuse to capture a page whose webfonts failed to load: it renders with
 * fallback metrics — a lookalike layout that diffs against a real-font
 * baseline. Failing lets a retry's fresh load refetch the fonts instead of
 * shipping the lookalike to the comparison. document.fonts.check() cannot
 * detect this — a locally installed family reports available while the
 * webfont is unloaded — so the gate is FontFace status, after fonts settle.
 */
export async function assertWebfontsLoaded(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const erroredFonts = await page.evaluate(() => [
    ...new Set(
      [...document.fonts].filter(f => f.status === 'error').map(f => f.family),
    ),
  ]);
  if (erroredFonts.length > 0) {
    throw new Error(`webfonts failed to load: ${erroredFonts.join(', ')}`);
  }
}

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
      // Gate every capture on webfont success, whichever backend runs it.
      const guardedUse = (check: VisualCheck) =>
        use(async (name, opts) => {
          await assertWebfontsLoaded(page);
          await check(name, opts);
        });
      if (PROVIDER === 'applitools') {
        await withApplitoolsCheck(page, testInfo, guardedUse, config.appName);
      } else {
        await withPlaywrightCheck(page, testInfo, guardedUse);
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
    // Inherit the config's retries (like the functional project) so a lost
    // font/render race retries instead of reddening the job on first miss.
    fullyParallel: false,
    snapshotPathTemplate:
      '.visual-baselines/{testFileName}/{arg}-{projectName}-{platform}{ext}',
  }));
}

export {expect};
export type {VisualCheck, VisualCheckOptions, VisualTestConfig} from './types';
