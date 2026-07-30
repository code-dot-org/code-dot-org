import {expect, test} from '@playwright/test';

import {FallbackPlayerCaptionDialogLinkComponent} from '../components/fallback-player-caption-dialog-link';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';

// Trigger link contrast is 3.35:1, needs 4.5:1; Maze's link sits on a passing background.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  standaloneInitialLoad: {'color-contrast': 1},
  standaloneDialogOpen: {'color-contrast': 1},
  mazeInitialLoad: {},
  mazeDialogOpen: {},
};

// WebKit's axe judges the backdrop-obscured link opposite to Chromium/Firefox.
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
