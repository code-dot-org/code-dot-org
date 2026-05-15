import {createTeacherAssociatedStudent, signIn} from '../../../shared/auth';
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/craft/aquatic.feature
   * Scenario: Winning the first level
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
 * Minecraft dialog levels — Minecraft Hour of Code course, level 1.
 *
 * Source: dashboard/test/ui/features/star_labs/craft/dialogs.feature
 * Scenario: Playing level 1, seeing character select dialog and re-playing.
 */
test.describe('Craft — Minecraft Hour of Code dialogs', () => {
  let craft: Craft;

  test.beforeEach(async ({page}) => {
    craft = new Craft(page);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/craft/dialogs.feature
   * Scenario: Playing level 1, seeing character select dialog and re-playing
   *
   * The source feature is tagged @skip for Selenium CI instability. This port
   * keeps the functional checks and omits the commented Eyes checkpoints.
   */
  test('level 1 shows character dialog, feedback, congrats, and replay flow', async () => {
    await craft.gotoMinecraftHourOfCodeDialogLevel(1);
    await expect(craft.gettingStartedHeader).toBeVisible();

    await craft.characterSelectCloseButton.click();
    await craft.instructionsOkButton.click();
    await expect(craft.runButton).toBeVisible();
    await craft.waitForMinecraftLoaded();

    await craft.run();
    await expect(craft.inlineFeedback).toHaveText(
      'Try using more commands to walk to the sheep.',
    );
    await expect(craft.resetButton).toBeVisible();

    await craft.reset();
    await expect(craft.runButton).toBeVisible();

    await craft.dragFlyoutBlockToWorkspaceBlock(
      'craft_moveForward',
      'craft_moveForward',
      {expectedWorkspaceText: /Workspace\s*:\s*3\s*\/\s*3 blocks/},
    );
    await craft.run();
    await expect(craft.congratsMessage).toContainText('Congratulations', {
      timeout: 30_000,
    });

    await craft.againButton.click();
    await expect(craft.congratsMessage).toBeHidden();
    await expect(craft.resetButton).toBeVisible();

    await craft.reset();
    await expect(craft.runButton).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/craft/dialogs.feature
   * Scenario: Playing level 6, seeing house select dialog
   *
   * The source scenario is tagged @skip alongside the legacy Eyes assertions.
   * Keep an explicit trace here so the skipped upstream visual flow is
   * accounted for without reintroducing the retired Selenium visual checkpoint.
   */
  test.skip('level 6 house select dialog visual flow', async () => {});
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/craft/hero_logged_out.feature
   * Scenario: Signed out finish dialog
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
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/craft/hero_logged_in.feature
   * Scenario: Signed in finish dialog
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

test.describe('Craft — mobile finish button', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/craft/can_see_finish.feature
   * Scenario: can see finish button on "Minecraft Adventurer"
   * @only_mobile
   */
  test('Minecraft Adventurer free-play level shows finish button on mobile', async ({
    page,
  }) => {
    const pair = await createTeacherAssociatedStudent(page, {
      studentName: 'Sally',
      authorized: true,
    });
    await signIn(page, pair.teacherEmail, pair.teacherPassword);
    await page.setViewportSize({width: 1024, height: 768});

    const craft = new Craft(page);
    await page.goto(
      '/courses/allthethingscourse/units/1/lessons/25/levels/5?noautoplay=true&no_redirect=true',
    );
    await craft.waitForLabPage();
    await page
      .locator('#runButton')
      .evaluate(element => (element as HTMLElement).click());
    await expect(craft.finishButton).toBeInViewport({timeout: 30_000});
  });
});
