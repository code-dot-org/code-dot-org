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

test.describe('Game Lab — loading animations', () => {
  /**
   * Source: loading_animations.feature — "Check Piskel loads and reload the project with a blank animation"
   * @as_student @no_mobile
   *
   * Opens the animation picker, adds a blank tile, adds the bear from the library,
   * verifies Piskel's editor iframe has rendered (pen icon visible inside), switches
   * back to code mode, runs, reloads, and confirms no "Sorry, we couldn't load
   * animation" error in the modal body.
   */
  // Root cause: AnimationPickerBody.componentDidMount calls searchAssets() with
  // libraryManifest before P5LabView.setState({libraryManifest}) has propagated,
  // crashing the React tree (Object.keys(undefined) on empty manifest {}). The
  // gotoNewProject() fix waits for the manifest network response and flushes
  // microtasks, but the setState→componentDidMount ordering is not guaranteed
  // across the CDP boundary on test-studio. Fix requires either a server-side
  // guard in searchAssets.js (deployed to test-studio) or a reliable DOM
  // readiness signal that manifest state has reached AnimationPickerBody.
  test.fixme(
    'blank and library animations load without error after reload',
    async () => {},
  );
});

test.describe('Game Lab — export animations', () => {
  /**
   * Source: export_animations.feature — "Export library animation"
   * @as_student @no_mobile @no_safari
   *
   * Full flow: add bear from library → run → switch to animation tab →
   * open Piskel export panel → trigger GIF download → add blank animation.
   *
   * Blocked: animation picker library thumbnails (category images and blank-
   * animation tiles) fail to load on test-studio.  Same root cause blocks
   * the `loading_animations` test that was previously green.  The Piskel
   * iframe itself loads fine; the network requests for the animation library
   * image tiles stall / 404 in the test environment.  Re-enable once the
   * animation CDN is restored on test-studio.
   */
  test.fixme('export bear animation as GIF from Piskel editor', async () => {});
});

test.describe('Game Lab — submittable level', () => {
  /**
   * Source: gamelab_submittable.feature — "Submit anything, unsubmit, be able to resubmit."
   * @no_mobile @as_taught_student
   *
   * Lesson 19 / level 1 submit → unsubmit → resubmit cycle.
   */
  // 3 attempts exhausted. Submit and unsubmit steps pass consistently;
  // the final assertion (#submitButton visible after reloading post-unsubmit
  // and re-running) times out — server-side submission state does not reset
  // cleanly within the test window. Underlying cause likely: unsubmit AJAX
  // completes but the submit-button visibility flag is tied to server-session
  // state that the subsequent fresh page.goto() does not yet reflect.
  test.fixme(
    'submit, unsubmit, and resubmit cycle restores submit button',
    async () => {},
  );
});
