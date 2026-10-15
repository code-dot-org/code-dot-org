import {expect, test} from '../../fixtures';
import {LegacyBlocklyLab} from '../../pages/legacy-blockly-lab';
import {UnitOverviewPage} from '../../pages/unit-overview-page';
import {resetSession} from '../../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../../shared/axe';

import {K1_MAZE_BLOCKS} from './blocks';

// Progress repaints only after the milestone POST + re-fetch settle; match
// progress.rb's 30s color poll rather than the suite's default 15s expect
// timeout, which under CI contention can lapse before the bubble updates.
const PROGRESS_TIMEOUT_MS = 30_000;
const poll = {timeout: PROGRESS_TIMEOUT_MS};

// Accessibility baseline for the two progress surfaces, each scoped to its own
// DOM (not the shared header/footer chrome). rule id -> failing node count, the
// way multi.spec documents it; a new violation outside this set fails the scan.
//   lessonHeader: the lesson-progress bubble strip is clean.
//   summaryTable: clean. The unit-overview progress bubbles used to contribute 3
//     color-contrast nodes; the new brand palette recolored them and they now
//     pass. Kept as an empty map so a new regression still fails.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  lessonHeader: {},
  summaryTable: {},
};

/** Solves lesson 2 level 1 (load the K1 solution and run), ending on that level page. */
async function solveLevelOne(maze: LegacyBlocklyLab): Promise<void> {
  await maze.gotoLevel({lesson: 2, level: 1});
  await maze.loadBlocks(K1_MAZE_BLOCKS);
  await maze.run();
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
      // Two cold Blockly lab boots per test (level 1, then level 2); the 90s
      // default is tight on a slow webkit run, so allow extra headroom.
      test.slow();
      await signInAsNewUser({type: 'student', name: 'Test Student'});

      const maze = new LegacyBlocklyLab(page);
      await solveLevelOne(maze);
      await expect(maze.congratsMessage).toBeVisible(poll);

      await expect.poll(() => maze.isProgressBubblePerfect(1), poll).toBe(true);
      await expect
        .poll(() => maze.isProgressBubbleNotTried(2), poll)
        .toBe(true);

      expect(
        await analyze(page, {
          include: maze.progressSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.lessonHeader);

      await maze.gotoLevel({lesson: 2, level: 2});

      await expect.poll(() => maze.isProgressBubblePerfect(1), poll).toBe(true);
      await expect
        .poll(() => maze.isProgressBubbleNotTried(2), poll)
        .toBe(true);

      const unitOverview = new UnitOverviewPage(page);
      await unitOverview.gotoOverview();
      await expect(unitOverview.lessonCell(/Maze/)).toBeVisible();

      await expect
        .poll(
          () => unitOverview.isProgressBubblePerfect({lesson: 2, level: 1}),
          poll,
        )
        .toBe(true);
      await expect
        .poll(
          () => unitOverview.isProgressBubbleNotTried({lesson: 2, level: 2}),
          poll,
        )
        .toBe(true);

      expect(
        await analyze(page, {
          include: unitOverview.summaryTableSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.summaryTable);
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
      test.slow();
      await resetSession(page);

      // '/' redirects an anonymous session to /users/sign_in, which hides its
      // own "Sign in" header widget (SessionsController sets
      // @hide_sign_in_option) — so the signed-out check has to happen on the
      // level page instead, where that widget renders normally.
      const maze = new LegacyBlocklyLab(page);
      await solveLevelOne(maze);
      await expect(maze.congratsMessage).toBeVisible(poll);
      await maze.header.waitForSignedOut();

      await expect.poll(() => maze.isProgressBubblePerfect(1), poll).toBe(true);
      await expect
        .poll(() => maze.isProgressBubbleNotTried(2), poll)
        .toBe(true);

      await maze.gotoLevel({lesson: 2, level: 2});

      await expect.poll(() => maze.isProgressBubblePerfect(1), poll).toBe(true);
      await expect
        .poll(() => maze.isProgressBubbleNotTried(2), poll)
        .toBe(true);

      const unitOverview = new UnitOverviewPage(page);
      await unitOverview.gotoOverview();
      await expect(unitOverview.lessonCell(/Maze/)).toBeVisible();

      await expect
        .poll(
          () => unitOverview.isProgressBubblePerfect({lesson: 2, level: 1}),
          poll,
        )
        .toBe(true);
      await expect
        .poll(
          () => unitOverview.isProgressBubbleNotTried({lesson: 2, level: 2}),
          poll,
        )
        .toBe(true);
    },
  );
});
