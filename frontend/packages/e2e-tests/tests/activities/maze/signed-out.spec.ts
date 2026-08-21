import {expect, test} from '../../fixtures';
import {LegacyBlocklyLab} from '../../pages/legacy-blockly-lab';
import {UnitOverviewPage} from '../../pages/unit-overview-page';
import {resetSession} from '../../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../../shared/axe';
import {labLevelUrl, unitResetUrl} from '../../shared/routes';

import {TWO_MOVE_FORWARD_BLOCKS} from './blocks';

const MAZE_COURSE = 'ui-test-maze';
const ARTIST_COURSE = 'ui-test-artist';

/**
 * Accessibility baseline for the distinct new surfaces this feature exercises
 * (the maze lab's own initial-load surface, congrats dialog, inline failure
 * feedback, video modal and callout). The lesson-header and unit-overview
 * progress-bubble surfaces are the same DOM this feature group's
 * progress.spec.ts already baselines, so are not re-scanned here.
 *
 *   initialLoad: the cold lab boot (Blocks/Workspace panes, run button).
 *     aria-required-children: `g[role="listbox"]` (the Blockly block-palette
 *       canvas) has [role=none]/[role=figure] children that role=listbox
 *       doesn't allow.
 *     color-contrast: #runButton's white-on-orange label (#ffffff on #f46800)
 *       measures 3.07:1, short of the 4.5:1 AA text threshold.
 *   congratsDialog: image-alt — .modal-image (the win/avatar illustration,
 *     e.g. win_avatar.png) has no alt text.
 *   videoModal: the autoplaying video overlay (tabs, YouTube iframe, captions).
 *     aria-allowed-attr (YouTube's own injected aria-level on a link),
 *     aria-required-children (the qTip2 tablist's `<a>` children aren't a
 *     role tablist allows), and nested-interactive x2 (the tab `<li>`s carry
 *     a tabindex an AT can still reach) are consistent on every engine, once
 *     the scan waits for the embedded YouTube iframe's own load event
 *     (IntroVideoModalComponent.waitForVideoLoaded) rather than racing it —
 *     without that wait the count varies run to run on the SAME engine
 *     (confirmed on webkit) as YouTube's cross-origin DOM keeps mounting.
 *     aria-prohibited-attr (an aria-label on YouTube's own unroled
 *     #movie_player div) is the one stable, reproducible engine split even
 *     with that wait: Firefox never sees the attribute land in time.
 *   inlineFeedback and callout are clean.
 */
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  initialLoad: {'aria-required-children': 1, 'color-contrast': 1},
  congratsDialog: {'image-alt': 1},
  inlineFeedback: {},
  videoModal: {
    'aria-allowed-attr': 1,
    'aria-prohibited-attr': 1,
    'aria-required-children': 1,
    'nested-interactive': 2,
  },
  callout: {},
};

const VIDEO_MODAL_OVERRIDES: Record<string, Record<string, number>> = {
  firefox: {
    'aria-allowed-attr': 1,
    'aria-required-children': 1,
    'nested-interactive': 2,
  },
};

function expectedVideoModalViolations(
  browserName: string,
): Record<string, number> {
  return VIDEO_MODAL_OVERRIDES[browserName] ?? EXPECTED_VIOLATIONS.videoModal;
}

test.describe('Maze level tests for users that are signed out', () => {
  test.beforeEach(async ({page}) => {
    await resetSession(page);
    // Background: reset the unit's client_state/session before each scenario.
    await page.goto(unitResetUrl({course: MAZE_COURSE}));
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/maze_signed_out.feature
   * "Solving a puzzle marks it perfect in the header and unit overview, and reset clears the saved progress and code"
   */
  test('Solving a puzzle marks it perfect in the header and unit overview, and reset clears the saved progress and code', async ({
    page,
  }) => {
    test.slow();
    const maze = new LegacyBlocklyLab(page);
    const levelOneUrl = labLevelUrl({
      course: MAZE_COURSE,
      lesson: 1,
      level: 1,
    });
    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 1});

    expect(
      await analyze(page, {
        include: maze.mainContentSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.initialLoad);

    await maze.loadBlocks(TWO_MOVE_FORWARD_BLOCKS);
    await maze.run();

    await expect(maze.feedbackDialog.congratsMessage).toBeVisible();
    await expect(maze.feedbackDialog.congratsMessage).toContainText(
      'You completed Puzzle 1.',
    );

    expect(
      await analyze(page, {
        include: maze.feedbackDialog.rootSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.congratsDialog);

    await maze.feedbackDialog.close();
    await expect(maze.feedbackDialog.congratsMessage).toBeHidden();
    // Closing the dialog doesn't redirect to the next level.
    await expect(page).toHaveURL(levelOneUrl);

    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 2});
    await expect(maze.headerProgressBubble(1)).toShowProgress('perfect');

    const unitOverview = new UnitOverviewPage(page);
    await unitOverview.gotoOverview({course: MAZE_COURSE});
    await expect(
      unitOverview.summaryProgressBubble({lesson: 1, level: 1}),
    ).toShowProgress('perfect');

    // A different course's own progress is unaffected.
    await maze.gotoLevel({course: ARTIST_COURSE, lesson: 1, level: 2});
    await expect(maze.headerProgressBubble(1)).toShowProgress('not_tried');

    // The solved level source (the two chained blocks) is saved...
    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 1});
    await expect(
      maze.blockChild({child: 'moveForward', parent: 'startBlock'}),
    ).toBeAttached();

    // ...and reset clears it.
    await page.goto(unitResetUrl({course: MAZE_COURSE}));
    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 1});
    await expect(
      maze.blockChild({child: 'moveForward', parent: 'startBlock'}),
    ).not.toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/maze_signed_out.feature
   * "Failing a puzzle and reloading marks it attempted in the header and unit overview"
   */
  test('Failing a puzzle and reloading marks it attempted in the header and unit overview', async ({
    page,
  }) => {
    test.slow();
    const maze = new LegacyBlocklyLab(page);
    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 1});
    await maze.run();

    await expect(maze.inlineFeedback).toBeVisible();
    expect(
      await analyze(page, {
        include: maze.inlineFeedbackSelector,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS.inlineFeedback);

    await page.reload();
    await maze.waitForReady();

    await expect(maze.headerProgressBubble(1)).toShowProgress('attempted');

    const unitOverview = new UnitOverviewPage(page);
    await unitOverview.gotoOverview({course: MAZE_COURSE});
    await expect(
      unitOverview.summaryProgressBubble({lesson: 1, level: 1}),
    ).toShowProgress('attempted');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/maze_signed_out.feature
   * "Video modal is shown once and does not reappear when returning to the puzzle"
   */
  test(
    'Video modal is shown once and does not reappear when returning to the puzzle',
    {tag: '@no_mobile'},
    async ({page, browserName}) => {
      const maze = new LegacyBlocklyLab(page);
      // No noautoplay here: the modal only appears when the level video autoplays.
      await maze.gotoLevelUrl(
        labLevelUrl({
          course: MAZE_COURSE,
          lesson: 1,
          level: 3,
          noautoplay: false,
        }),
        // The modal is this scenario's subject, so waitForReady must leave it
        // standing rather than dismissing it as lab-blocking chrome.
        {dismissIntroVideo: false},
      );
      await expect(maze.introVideoModal.container).toBeVisible();
      await maze.introVideoModal.waitForVideoLoaded();

      expect(
        await analyze(page, {
          include: maze.introVideoModal.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(expectedVideoModalViolations(browserName));

      await maze.introVideoModal.close();

      await maze.gotoLevel({
        course: MAZE_COURSE,
        lesson: 1,
        level: 4,
        noautoplay: false,
      });
      await maze.gotoLevel({
        course: MAZE_COURSE,
        lesson: 1,
        level: 3,
        noautoplay: false,
      });

      // The manual reference-area link still reopens the video modal even
      // though the automatic autoplay trigger only shows it once.
      await maze.referenceAreaLastLink.click();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/student_learning/maze_signed_out.feature
   * "Callout is shown once and does not reappear when returning to the puzzle"
   */
  test('Callout is shown once and does not reappear when returning to the puzzle', async ({
    page,
  }) => {
    const maze = new LegacyBlocklyLab(page);
    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 4});

    const callout = maze.callouts.calloutWithText('Blocks that are grey');
    await expect(callout).toBeVisible();
    expect(
      await analyze(page, {include: '.cdo-qtips', tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.callout);

    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 3});
    await maze.gotoLevel({course: MAZE_COURSE, lesson: 1, level: 4});
    await expect(callout).not.toBeAttached();
  });
});
