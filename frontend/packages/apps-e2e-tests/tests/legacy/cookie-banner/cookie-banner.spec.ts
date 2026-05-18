import {expect, test} from '../../shared/fixtures';

/**
 * Cookie banner — accept/dismiss behaviour on a Studio level page.
 *
 * Source:
 *   dashboard/test/ui/features/xteam/cookie_banner.feature
 *
 * Anonymous; no authentication required.
 * The @eyes visual checkpoints are skipped; the functional behaviour is ported:
 * accepting the banner persists the consent cookie so the banner stays hidden
 * on subsequent visits (even with ?show_cookie_banner_on_test=true).
 */

const LEVEL_URL = '/courses/frozen/units/1/lessons/1/levels/1';

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/xteam/cookie_banner.feature
 * Scenario: Show cookie banner, dismiss it and confirm it's dismissed
 */
test(
  'cookie banner: accepted on first visit and suppressed on reload',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto(`${LEVEL_URL}?show_cookie_banner_on_test=true`);
    await page
      .locator('#runButton, .uitest-lab-container')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});

    // Dismiss any language-selector overlay that may obscure the banner.
    const closeBtn = page.locator('.close');
    if (await closeBtn.isVisible({timeout: 2_000}).catch(() => false)) {
      await closeBtn.click();
    }

    // Banner is visible on first visit (no consent cookie yet).
    await page
      .locator('#accept-cookies')
      .waitFor({state: 'visible', timeout: 10_000});
    await page.locator('#accept-cookies').click();
    await page
      .locator('#accept-cookies')
      .waitFor({state: 'hidden', timeout: 10_000});

    // Reload: consent cookie is now set — banner must stay hidden.
    await page.reload();
    await page
      .locator('#runButton, .uitest-lab-container')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});

    // Re-navigate with the test query param — banner still suppressed.
    await page.goto(`${LEVEL_URL}?show_cookie_banner_on_test=true`);
    await page
      .locator('#runButton, .uitest-lab-container')
      .first()
      .waitFor({state: 'visible', timeout: 30_000});
    await expect(page.locator('#accept-cookies')).not.toBeVisible({
      timeout: 10_000,
    });
  },
);
