import {expect, test} from '@playwright/test';

import {FallbackPlayerCaptionDialogLinkComponent} from '../components/fallback-player-caption-dialog-link';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';

// Expected violations per surface/state: rule id -> failing node count,
// scoped to the component's own root (see rootSelector). Measured against
// test-studio.
//   standaloneInitialLoad color-contrast: the "Closed Captioning and
//   Translations" trigger link, rgb(5, 150, 206) on white = 3.35:1, needs
//   4.5:1 for this 13px/400-weight (non-large) text.
//   standaloneDialogOpen: same trigger link/violation persists once the
//   dialog mounts alongside it.
//   The Maze surface's caption link sits inside the video/notes tab strip
//   with a different (passing) background, hence no violation there.
// CROSS-BROWSER FINDING (confirmed, not a scan race): once the dialog opens,
// its modal-backdrop visually covers the trigger link (verified via
// elementFromPoint — stable immediately after click, no scroll/layout drift
// over time). Chromium and Firefox agree on the counts below; WebKit's axe
// build resolves color-contrast for that obscured link the opposite way on
// both surfaces. Reproduced deterministically: 5/5 full-spec repeats and 3/3
// direct AxeBuilder re-scans of the same already-open dialog gave identical,
// stable per-browser results — i.e. the value depends on the browser engine,
// not on scan timing. See webkitDialogOpenOverrides below.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  standaloneInitialLoad: {'color-contrast': 1},
  standaloneDialogOpen: {'color-contrast': 1},
  mazeInitialLoad: {},
  mazeDialogOpen: {},
};

// WebKit-measured counts for the two *DialogOpen states, inverted from
// EXPECTED_VIOLATIONS (see finding above).
const WEBKIT_DIALOG_OPEN_OVERRIDES: Record<string, Record<string, number>> = {
  standaloneDialogOpen: {},
  mazeDialogOpen: {'color-contrast': 1},
};

function expectedViolations(
  key: keyof typeof EXPECTED_VIOLATIONS,
  browserName: string,
): Record<string, number> {
  if (browserName === 'webkit' && key in WEBKIT_DIALOG_OPEN_OVERRIDES) {
    return WEBKIT_DIALOG_OPEN_OVERRIDES[key];
  }
  return EXPECTED_VIOLATIONS[key];
}

test.describe('Fallback player caption dialog link', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature "Standalone level with fallback video player has captions popup"
   */
  test(
    'Standalone level with fallback video player has captions popup',
    {tag: ['@no_mobile']},
    async ({page, browserName}) => {
      const lessonLevel = new LessonLevelPage(page);
      // noautoplay:false reproduces the Cucumber step's literal URL (?force_youtube_fallback=1 only).
      await lessonLevel.gotoLevel({
        lesson: 34,
        level: 1,
        noautoplay: false,
        forceYoutubeFallback: true,
      });

      const captionDialog = new FallbackPlayerCaptionDialogLinkComponent(page);
      // Presence-only per the legacy step; this level's autoplay=0 so it's visible too.
      await expect(captionDialog.bigPlayButton).toBeAttached();
      await expect(captionDialog.captionLink).toBeVisible();

      expect(
        await analyze(page, {
          include: captionDialog.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(expectedViolations('standaloneInitialLoad', browserName));

      await captionDialog.open();
      await expect(captionDialog.dialogHeading).toBeVisible();

      expect(
        await analyze(page, {
          include: captionDialog.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(expectedViolations('standaloneDialogOpen', browserName));

      await captionDialog.close();
      await expect(captionDialog.dialogHeading).toBeHidden();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature "Level with fallback video player in dialog has captions popup"
   */
  test(
    'Level with fallback video player in dialog has captions popup',
    {tag: ['@no_mobile']},
    async ({page, browserName}) => {
      const lessonLevel = new LessonLevelPage(page);
      await lessonLevel.gotoLevel({
        lesson: 2,
        level: 1,
        noautoplay: false,
        forceYoutubeFallback: true,
      });

      const captionDialog = new FallbackPlayerCaptionDialogLinkComponent(page);
      // Presence-only: autoplay=1 keeps the play-button container display:none here.
      await expect(captionDialog.bigPlayButton).toBeAttached();
      await expect(captionDialog.captionLink).toBeVisible();

      expect(
        await analyze(page, {
          include: captionDialog.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(expectedViolations('mazeInitialLoad', browserName));

      await captionDialog.open();
      await expect(captionDialog.dialogHeading).toBeVisible();

      expect(
        await analyze(page, {
          include: captionDialog.rootSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(expectedViolations('mazeDialogOpen', browserName));

      await captionDialog.close();
      await expect(captionDialog.dialogHeading).toBeHidden();
    },
  );
});
