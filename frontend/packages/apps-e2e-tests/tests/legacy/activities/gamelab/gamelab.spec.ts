import {createTeacherAssociatedStudent} from '../../../shared/auth';
import {expect, test} from '../../../shared/fixtures';

import {GameLab} from './GameLab';

/**
 * Game Lab — level options, animation tab, loading animations, submittable level.
 *
 * Sources:
 *   dashboard/test/ui/features/star_labs/gamelab/level_options.feature
 *   dashboard/test/ui/features/star_labs/gamelab/loading_animations.feature
 *   dashboard/test/ui/features/star_labs/gamelab_submittable.feature
 */

test.describe('Game Lab — level options', () => {
  /**
   * Source: level_options.feature — "A level with the animation tab disabled hides the mode toggle"
   * Migration status: COMPLETED
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
   * Migration status: COMPLETED
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
   * Migration status: COMPLETED
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
   * Migration status: COMPLETED
   * @as_student
   *
   * Runs the level (which has pre-seeded sprites) and confirms no
   * "Unable to find an animation" error appears in the console.  The readiness
   * signal is the draw loop frame counter, not Cucumber's fixed sleep.
   */
  test(
    'initial animations are usable on level with no animation tab',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      const gamelab = new GameLab(studentPage);
      await gamelab.reloadLevel(1);

      await gamelab.run();
      await gamelab.waitForDrawLoop();
      await expect(gamelab.consoleOutput).not.toContainText(
        'Unable to find an animation',
      );
    },
  );

  /**
   * Source: level_options.feature — "Initial animations show up in the animation tab"
   * Migration status: COMPLETED
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

test.describe('Game Lab — loading animations', () => {
  /**
   * Source: loading_animations.feature — "Check Piskel loads and reload the project with a blank animation"
   * Migration status: COMPLETED
   * @as_student @no_mobile
   *
   * Opens the animation picker, adds a blank tile, adds the bear from the library,
   * verifies Piskel's editor iframe has rendered (pen icon visible inside), switches
   * back to code mode, runs, reloads, and confirms no "Sorry, we couldn't load
   * animation" error in the modal body.
   */
  test(
    'blank and library animations load without error after reload',
    {tag: '@no_mobile'},
    async ({browserName, studentPage}) => {
      test.skip(
        browserName === 'firefox',
        'Playwright Firefox headless SIGSEGVs after Game Lab embeds Piskel; the same flow passes in Firefox under Xvfb.',
      );

      const gamelab = new GameLab(studentPage);
      await gamelab.gotoNewProject();

      await gamelab.switchToAnimationTab();
      await gamelab.addBlankAnimation();
      await gamelab.addBearAnimation();
      await gamelab.waitForPiskelEditor();
      await gamelab.switchToCodeTab();
      await gamelab.run();
      await gamelab.waitForDrawLoop();

      await studentPage.reload();
      await gamelab.waitForLabPage();
      await expect(
        studentPage.getByText("Sorry, we couldn't load animation"),
      ).not.toBeAttached();
    },
  );
});

test.describe('Game Lab — export animations', () => {
  /**
   * Source: export_animations.feature — "Export library animation"
   * Migration status: COMPLETED
   * @as_student @no_mobile @no_safari
   *
   * Full flow: add bear from library → run → switch to animation tab →
   * open Piskel export panel → trigger GIF download → add blank animation.  The
   * download event and then the visible blank-animation tile are the completion
   * signals.
   */
  test(
    'export bear animation as GIF from Piskel editor',
    {tag: ['@no_mobile', '@no_safari']},
    async ({browserName, studentPage}) => {
      test.skip(
        browserName === 'webkit' || browserName === 'firefox',
        browserName === 'webkit'
          ? 'Source scenario is tagged @no_safari because Safari does not allow downloads in this environment.'
          : 'Playwright Firefox headless SIGSEGVs after Game Lab embeds Piskel; the same flow passes in Firefox under Xvfb.',
      );

      const gamelab = new GameLab(studentPage);
      await gamelab.gotoNewProject();

      await gamelab.switchToAnimationTab();
      await gamelab.addBearAnimation();
      await gamelab.switchToCodeTab();
      await gamelab.run();
      await gamelab.waitForDrawLoop();

      await gamelab.switchToAnimationTab();
      await gamelab.exportGif();
      await gamelab.addBlankAnimation();
      await gamelab.waitForPiskelEditor();
    },
  );
});

test.describe('Game Lab — submittable level', () => {
  /**
   * Source: gamelab_submittable.feature — "Submit anything, unsubmit, be able to resubmit."
   * Migration status: COMPLETED
   * @no_mobile @as_taught_student
   *
   * Lesson 19 / level 1 submit → unsubmit → resubmit cycle.  Requires a
   * teacher-associated student so submit/unsubmit controls render.
   */
  test(
    'submit, unsubmit, and resubmit cycle restores submit button',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createTeacherAssociatedStudent(page);
      const gamelab = new GameLab(page);

      await gamelab.reloadLevel(1);
      await gamelab.submitAssessment();

      await gamelab.reloadLevel(1);
      await expect(gamelab.unsubmitButton).toBeVisible({timeout: 30_000});

      await gamelab.unsubmitAssessment();

      await gamelab.reloadLevel(1);
      await gamelab.run();
      await gamelab.waitForDrawLoop();
      await expect(gamelab.submitButton).toBeVisible({timeout: 30_000});
    },
  );
});
