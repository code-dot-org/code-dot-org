import {type Page} from '@playwright/test';

import {expect, test} from '../../fixtures';
import {MazeLab} from '../../pages/maze-lab';
import {UnitOverviewPage} from '../../pages/unit-overview-page';
import {resetSession} from '../../shared/auth';

import {K1_MAZE_BLOCKS} from './blocks';

// Progress repaints only after the milestone POST + re-fetch settle; match
// progress.rb's 30s color poll rather than the suite's default 15s expect
// timeout, which under CI contention can lapse before the bubble updates.
const PROGRESS_TIMEOUT_MS = 30_000;

/** Completes lesson 2 level 1, ending on the level page it started from. */
async function completeLevelOne(maze: MazeLab): Promise<void> {
  await maze.gotoLevel({lesson: 2, level: 1});
  await maze.loadBlocks(K1_MAZE_BLOCKS);
  await maze.run();
  await expect(maze.congratsMessage).toBeVisible({
    timeout: PROGRESS_TIMEOUT_MS,
  });
}

/**
 * Verifies level 1 shows 'perfect' and level 2 'not_tried' in the lesson header
 * (on both level pages) and the unit-overview summary — the shared tail of both
 * progress scenarios. Each not_tried check follows a perfect check on the same
 * page load, which gates on progress having settled.
 */
async function assertProgressPersisted(
  page: Page,
  maze: MazeLab,
): Promise<void> {
  const poll = {timeout: PROGRESS_TIMEOUT_MS};

  await expect.poll(() => maze.isProgressBubblePerfect(1), poll).toBe(true);
  await expect.poll(() => maze.isProgressBubbleNotTried(2), poll).toBe(true);

  await maze.gotoLevel({lesson: 2, level: 2});

  await expect.poll(() => maze.isProgressBubblePerfect(1), poll).toBe(true);
  await expect.poll(() => maze.isProgressBubbleNotTried(2), poll).toBe(true);

  const unitOverview = new UnitOverviewPage(page);
  await unitOverview.goto();
  await expect(unitOverview.lessonCell(/Maze/)).toBeVisible();

  await expect
    .poll(() => unitOverview.isProgressBubblePerfect(2, 1), poll)
    .toBe(true);
  await expect
    .poll(() => unitOverview.isProgressBubbleNotTried(2, 2), poll)
    .toBe(true);
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
      await assertProgressPersisted(page, maze);
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
      await assertProgressPersisted(page, maze);
    },
  );
});
