import {expect, test} from '@playwright/test';

import {Craft} from './Craft';

/**
 * Minecraft: Hero's Journey — lesson 25 of allthethingscourse, level 4.
 *
 * Source: dashboard/test/ui/features/star_labs/craft/hero_logged_out.feature
 * Scenario: Signed out finish dialog.
 */
test.describe('Craft — lesson 25 — signed-out finish dialog (level 4)', () => {
  let craft: Craft;

  test.beforeEach(async ({page}) => {
    craft = new Craft(page);
    await craft.gotoLevel(4);
  });

  /**
   * Source: hero_logged_out.feature "Signed out finish dialog"
   * Verifies that signed-out users see the continue button but not the
   * publish-to-gallery or save-to-gallery buttons after completing the level.
   */
  test('signed-out user sees continue but not gallery buttons', async () => {
    await craft.run();
    await craft.finish();
    await expect(craft.continueButton).toBeVisible();
    await expect(craft.publishToProjectGalleryButton).not.toBeVisible();
    await expect(craft.saveToProjectGalleryButton).not.toBeVisible();
  });
});
