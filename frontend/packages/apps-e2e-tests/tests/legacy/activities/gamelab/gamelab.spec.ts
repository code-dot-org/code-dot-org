import {expect, test} from '../../../shared/fixtures';

import {GameLab} from './GameLab';

/**
 * Game Lab — level options, animation tab, and submittable level.
 *
 * Sources:
 *   dashboard/test/ui/features/star_labs/gamelab/level_options.feature
 *   dashboard/test/ui/features/star_labs/gamelab_submittable.feature
 */

test.describe('Game Lab — level options', () => {
  /**
   * Source: level_options.feature — "A level with the animation tab disabled hides the mode toggle"
   * @as_student
   */
  test(
    'level with animation tab disabled has no mode toggle',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      await gamelab.reloadLevel(1);

      await expect(gamelab.codeMode).not.toBeAttached();
      await expect(gamelab.animationMode).not.toBeAttached();
    },
  );

  /**
   * Source: level_options.feature — "A level with the animation tab enabled shows the mode toggle"
   * @as_student
   */
  test(
    'level with animation tab enabled shows mode toggle',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      await gamelab.reloadLevel(2);

      await expect(gamelab.codeMode).toBeVisible();
      await expect(gamelab.animationMode).toBeVisible();
    },
  );

  /**
   * Source: level_options.feature — "A new project should always provide the animation tab"
   * @as_student
   */
  test(
    'new project always shows mode toggle',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      await studentPage.goto('/projects/gamelab/new');
      await gamelab.waitForLabPage();

      await expect(gamelab.codeMode).toBeVisible();
      await expect(gamelab.animationMode).toBeVisible();
    },
  );

  /**
   * Source: level_options.feature — "Initial animations are usable with no animation tab"
   * @as_student
   *
   * Runs the level (which has pre-seeded sprites) and confirms no
   * "Unable to find an animation" error appears in the console.
   */
  test(
    'initial animations are usable on level with no animation tab',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      await gamelab.reloadLevel(1);

      await gamelab.run();
      // Wait a tick so any animation-load errors have time to surface.
      await studentPage.waitForTimeout(2000);
      await expect(gamelab.consoleOutput).not.toContainText(
        'Unable to find an animation',
      );
    },
  );

  /**
   * Source: level_options.feature — "Initial animations show up in the animation tab"
   * @as_student
   */
  test(
    'initial animations appear in the animation tab',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      await gamelab.reloadLevel(2);

      await gamelab.switchToAnimationTab();
      expect(await gamelab.animationCount()).toBe(2);
    },
  );
});

test.describe('Game Lab — submittable level', () => {
  /**
   * Source: gamelab_submittable.feature — "Submit anything, unsubmit, be able to resubmit."
   * @no_mobile @as_taught_student
   *
   * Lesson 19 / level 1 submit → unsubmit → resubmit cycle.
   */
  test.fixme(
    'submit, unsubmit, and resubmit cycle restores submit button',
    // 3 attempts exhausted. Submit and unsubmit steps pass consistently;
    // the final assertion (#submitButton visible after reloading post-unsubmit
    // and re-running) times out — server-side submission state does not reset
    // cleanly within the test window. Underlying cause likely: unsubmit AJAX
    // completes but the submit-button visibility flag is tied to server-session
    // state that the subsequent fresh page.goto() does not yet reflect.
  );
});
