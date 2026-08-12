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
// The scan excludes what is inside the #video iframe: that is a cross-origin
// YouTube document nothing here waits for, so its violation count is a
// function of scan timing (an immediate scan intermittently adds button-name
// on the channel-avatar button, which a later scan no longer reports), and
// YouTube can change that markup at any time. The iframe element itself stays
// in scope, so frame-title below is still ours to fix.
//
// Measured on test-studio across chromium, firefox and webkit: no variance,
// immediate or delayed.
//   color-contrast: "Download Video" link, #0596ce on #ffffff = 3.35:1,
//     needs 4.5:1.
//   frame-title: the #video iframe (the embedded player) has no title
//     attribute or other accessible name.
const EXPECTED_VIOLATIONS: Record<string, number> = {
  'color-contrast': 1,
  'frame-title': 1,
};

/** Cross-origin player contents; see EXPECTED_VIOLATIONS. */
const YOUTUBE_FRAME_CONTENTS = ['#video', '*'];

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
        exclude: YOUTUBE_FRAME_CONTENTS,
        tags: WCAG_AA_TAGS,
      }),
    ).toEqual(EXPECTED_VIOLATIONS);

    await level.continue();

    await level.gotoLevel({lesson: 34, level: 1});

    await expect.poll(() => level.isProgressBubblePerfect(1), poll).toBe(true);
  });
});
