import {expect, test} from '../../../shared/fixtures';

import {Craft} from './Craft';

/**
 * Minecraft: Aquatic — lesson 25 of allthethingscourse, level 3.
 *
 * Source: dashboard/test/ui/features/star_labs/craft/aquatic.feature
 * Scenario: Winning the first level.
 */
test.describe('Craft — lesson 25 — aquatic completion (level 3)', () => {
  let craft: Craft;

  test.beforeEach(async ({page}) => {
    craft = new Craft(page);
    await craft.gotoLevel(3);
  });

  /**
   * Source: dashboard/test/ui/features/star_labs/craft/aquatic.feature
   * Scenario: Winning the first level
   * Migration status: COMPLETED
   *
   * The Cucumber source is tagged @skip for an old Selenium CI instability.
   * Playwright waits for Craft.phaserLoaded(), then relies on the run/reset
   * button state and congrats dialog as the visible readiness signals.
   */
  test('signed-out user can win the first aquatic level', async () => {
    await expect(craft.runButton).toBeVisible();
    await expect(craft.resetButton).toBeHidden();

    await craft.run();

    await expect(craft.resetButton).toBeVisible();
    await expect(craft.congratsMessage).toBeVisible({timeout: 30_000});
  });
});

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
   * Source: dashboard/test/ui/features/star_labs/craft/hero_logged_out.feature
   * Scenario: Signed out finish dialog
   * Migration status: COMPLETED
   *
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

/**
 * Minecraft: Hero's Journey — lesson 25 of allthethingscourse, level 4.
 *
 * Source: dashboard/test/ui/features/star_labs/craft/hero_logged_in.feature
 * Scenario: Signed in finish dialog.
 */
test.describe('Craft — lesson 25 — signed-in finish dialog (level 4)', () => {
  /**
   * Source: dashboard/test/ui/features/star_labs/craft/hero_logged_in.feature
   * Scenario: Signed in finish dialog
   * Migration status: COMPLETED
   *
   * A signed-in student who completes the level sees both the continue button
   * and the save-to-project-gallery button in the finish dialog.  The gallery
   * save button is only rendered for authenticated users.
   */
  test('signed-in student sees continue and save-to-gallery buttons', async ({
    studentPage,
  }) => {
    const craft = new Craft(studentPage);
    await studentPage.goto(
      '/courses/allthethingscourse/units/1/lessons/25/levels/4?noautoplay=true',
    );
    // waitForLabPage honours the Craft override that checks phaserLoaded().
    await craft.waitForLabPage();
    await craft.run();
    await craft.finish();
    await expect(craft.continueButton).toBeVisible({timeout: 30_000});
    await expect(craft.saveToProjectGalleryButton).toBeVisible();
  });
});
