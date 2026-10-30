import {expect, test} from '../fixtures';
import {StandaloneVideoLevel} from '../pages/standalone-video-level';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';

// Progress repaints only after the milestone POST + re-fetch settle; match
// progress.rb's 30s color poll rather than the suite's default 15s expect
// timeout, which under CI contention can lapse before the bubble updates.
const PROGRESS_TIMEOUT_MS = 30_000;
const poll = {timeout: PROGRESS_TIMEOUT_MS};

// rule id -> failing node count, covering this level's own markup only.
//
// The scan excludes the #video iframe entirely, element and contents alike.
// Neither is a property of this page. The framed document is YouTube's markup,
// which changes without notice. The iframe's own accessible name is set from
// outside the page: where Google Tag Manager runs it hooks the embed and the
// YouTube IFrame API then sets title to the video's name. A CI trace caught
// that title landing between the pre-scan settle and axe's own run, so
// frame-title fired or not depending on which won by milliseconds — it failed
// on chromium and firefox and passed on webkit in a single run.
//
// So do not baseline frame-title here. The level does ship the iframe with no
// title of its own, and that gap is real for anyone whose analytics never
// load, but whether a scan sees a name is decided off this page and cannot
// carry an exact-equality assertion.
//
//   color-contrast: "Download Video" link, #0596ce on #ffffff = 3.35:1,
//     needs 4.5:1.
const EXPECTED_VIOLATIONS: Record<string, number> = {
  'color-contrast': 1,
};

/** Third-party embedded player; see EXPECTED_VIOLATIONS. */
const YOUTUBE_PLAYER = '#video';

test.describe('Standalone video levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/standalone_video.feature "Progress is posted when continue is clicked" (@as_student)
   */
  test('Progress is posted when continue is clicked', async ({
    page,
    signInAsNewUser,
  }) => {
    await signInAsNewUser({type: 'student', name: 'Test Student'});

    const level = new StandaloneVideoLevel(page);
    await level.gotoLevel({lesson: 34, level: 1});

    await expect.poll(() => level.isProgressBubbleNotTried(1), poll).toBe(true);

    expect(
      await analyze(page, {
        include: level.rootSelector,
        exclude: YOUTUBE_PLAYER,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS);

    await level.continue();

    await level.gotoLevel({lesson: 34, level: 1});

    await expect.poll(() => level.isProgressBubblePerfect(1), poll).toBe(true);
  });
});
