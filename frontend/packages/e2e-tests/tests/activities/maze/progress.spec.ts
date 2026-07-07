import {expect, test} from '../../fixtures';
import {MazeLab} from '../../pages/maze-lab';
import {UnitOverviewPage} from '../../pages/unit-overview-page';
import {resetSession} from '../../shared/auth';

import {K1_MAZE_BLOCKS} from './blocks';

/** Completes lesson 2 level 1 and returns to the level page it started from. */
async function completeLevelOne(maze: MazeLab): Promise<void> {
  await maze.gotoLevel({lesson: 2, level: 1});
  await maze.loadBlocks(K1_MAZE_BLOCKS);
  await maze.run();
  await expect(maze.congratsMessage).toBeVisible();
}

test.describe('Level Progress', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/progress.feature "Progress is saved for signed-in student"
   */
  test(
    'Progress is saved for signed-in student',
    {tag: '@no_mobile'},
    async ({page, signInAsNewUser}) => {
      await signInAsNewUser({type: 'student', name: 'Test Student'});

      const maze = new MazeLab(page);
      await completeLevelOne(maze);

      await expect.poll(() => maze.isProgressBubblePerfect(1)).toBe(true);
      await expect.poll(() => maze.isProgressBubbleNotTried(2)).toBe(true);

      await maze.gotoLevel({lesson: 2, level: 2});

      await expect.poll(() => maze.isProgressBubblePerfect(1)).toBe(true);
      await expect.poll(() => maze.isProgressBubbleNotTried(2)).toBe(true);

      const unitOverview = new UnitOverviewPage(page);
      await unitOverview.goto();
      await expect(unitOverview.lessonCell(/Maze/)).toBeVisible();

      await expect
        .poll(() => unitOverview.isProgressBubblePerfect(2, 1))
        .toBe(true);
      await expect
        .poll(() => unitOverview.isProgressBubbleNotTried(2, 2))
        .toBe(true);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/progress.feature "Progress is saved for signed-out student"
   */
  test(
    'Progress is saved for signed-out student',
    {tag: '@no_mobile'},
    async ({page}) => {
      await resetSession(page);

      // '/' redirects an anonymous session to /users/sign_in, which hides its
      // own "Sign in" header widget (SessionsController sets
      // @hide_sign_in_option) — so the signed-out check has to happen on the
      // level page instead, where that widget renders normally.
      const maze = new MazeLab(page);
      await completeLevelOne(maze);
      await maze.header.waitForSignedOut();

      await expect.poll(() => maze.isProgressBubblePerfect(1)).toBe(true);
      await expect.poll(() => maze.isProgressBubbleNotTried(2)).toBe(true);

      await maze.gotoLevel({lesson: 2, level: 2});

      await expect.poll(() => maze.isProgressBubblePerfect(1)).toBe(true);
      await expect.poll(() => maze.isProgressBubbleNotTried(2)).toBe(true);

      const unitOverview = new UnitOverviewPage(page);
      await unitOverview.goto();
      await expect(unitOverview.lessonCell(/Maze/)).toBeVisible();

      await expect
        .poll(() => unitOverview.isProgressBubblePerfect(2, 1))
        .toBe(true);
      await expect
        .poll(() => unitOverview.isProgressBubbleNotTried(2, 2))
        .toBe(true);
    },
  );
});
