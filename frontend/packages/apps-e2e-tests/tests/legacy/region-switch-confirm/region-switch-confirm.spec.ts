import {mockDcdo, mockGeolocation} from '../../shared/cookies';
import {expect, test} from '../../shared/fixtures';

/**
 * Global Edition — region-switch confirmation modal.
 *
 * Source:
 *   dashboard/test/ui/features/platform/global_edition/region_switch_confirm.feature
 *
 * Anonymous; no authentication required.
 * The modal fires when the DCDO flag enables it for the "fa" region and the
 * request IP is detected as Iranian via the GeolocationOverride cookie.
 */

test(
  'region-switch confirm modal shown for Iranian visitors when DCDO flag is set',
  {tag: '@no_mobile'},
  async ({page}) => {
    await page.goto('/');
    await page.evaluate(() => {
      sessionStorage.clear();
      localStorage.clear();
    });

    // Enable the modal for the Farsi region via DCDO cookie.
    await mockDcdo(page, 'global_edition_region_switch_confirm_enabled_in', [
      'fa',
    ]);
    // Spoof geolocation as Iran (185.113.112.255).
    await mockGeolocation(page, '185.113.112.255');

    await page.reload();
    await expect(
      page.locator(
        '#global-edition-region-switch-confirm.fade.in[role="dialog"]',
      ),
    ).toBeVisible({timeout: 30_000});
  },
);
