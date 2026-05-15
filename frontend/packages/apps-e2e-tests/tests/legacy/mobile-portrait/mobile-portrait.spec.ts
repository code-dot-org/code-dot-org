import {expect, test} from '../../shared/fixtures';

/**
 * Mobile portrait visual smoke ports.
 *
 * Source: dashboard/test/ui/features/star_labs/mobile_portait.feature
 */

const PORTRAIT_VIEWPORT = {width: 390, height: 844} as const;

/**
 * Open a level in portrait and assert the visible rotate-device overlay.
 *
 * @param page - Playwright page
 * @param url - level URL path from the Cucumber example row
 */
async function expectRotateOverlay(
  page: import('@playwright/test').Page,
  url: string,
): Promise<void> {
  await page.setViewportSize(PORTRAIT_VIEWPORT);
  await page.goto(url);
  await expect(page.locator('#runButton')).toBeVisible({timeout: 60_000});
  await expect(page.locator('#rotateContainer')).toBeVisible({timeout: 30_000});
  await expect(page.locator('#rotateText')).toContainText(
    /Rotate your device|Turn off orientation lock/,
  );
  // Visual checkpoint stub: "initial load".
}

test.describe('Mobile portrait rotate overlay', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/mobile_portait.feature
   * Scenario: Simple blockly level page view
   * @eyes_mobile
   */
  test('Blockly portrait levels show the rotate-device overlay', async ({
    page,
  }) => {
    await expectRotateOverlay(
      page,
      '/courses/allthethingscourse/units/1/lessons/18/levels/5?noautoplay=true',
    );
    await expectRotateOverlay(
      page,
      '/courses/allthethingscourse/units/1/lessons/37/levels/1?noautoplay=true',
    );
  });
});
