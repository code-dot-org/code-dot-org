import type {Page, TestInfo} from 'playwright/test';
import {expect} from 'playwright/test';

import type {VisualCheck, VisualCheckOptions} from './types';

/**
 * Native Playwright screenshot backend for visualCheck. Local-only — CI
 * must use the Eyes backend so visual diffs land in the dashboard.
 *
 * @param page - Playwright Page fixture.
 * @param _testInfo - TestInfo (unused; toHaveScreenshot consumes it implicitly).
 * @param use - Fixture use callback.
 */
export async function withPlaywrightCheck(
  page: Page,
  _testInfo: TestInfo,
  use: (check: VisualCheck) => Promise<void>,
): Promise<void> {
  if (process.env.CI === 'true') {
    throw new Error(
      '[visual] Native Playwright snapshot comparison is local-only. ' +
        'Set VISUAL_PROVIDER=applitools in CI.',
    );
  }

  const check: VisualCheck = async (
    name: string,
    opts: VisualCheckOptions = {},
  ): Promise<void> => {
    await expect(page).toHaveScreenshot(`${name}.png`, {
      animations: 'disabled',
      mask: opts.mask,
      fullPage: true,
    });
  };

  await use(check);
}
