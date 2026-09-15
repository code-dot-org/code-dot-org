import {expect, test} from '@playwright/test';

import {FallbackPlayerCaptionDialogLinkComponent} from '../components/fallback-player-caption-dialog-link';
import {LegacyBlocklyLab} from '../pages/legacy-blockly-lab';
import {LessonLevelPage} from '../pages/lesson-level-page';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';

// Trigger link contrast is 3.35:1, needs 4.5:1; Maze's link sits on a passing background.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  standaloneInitialLoad: {'color-contrast': 1},
  standaloneDialogOpen: {},
  mazeInitialLoad: {},
  mazeDialogOpen: {},
};

test.describe('Fallback player caption dialog link', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature "Standalone level with fallback video player has captions popup"
   */
  test(
    'Standalone level with fallback video player has captions popup',
    {tag: ['@no_mobile']},
    async ({page}) => {
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
      ).toEqual(EXPECTED_VIOLATIONS.standaloneInitialLoad);

      await captionDialog.open();
      await expect(captionDialog.dialogHeading).toBeVisible();

      // Scoped to the dialog, not the whole component: a root scan re-reads the
      // trigger link behind the modal, and axe's verdict there turns on whether
      // the modal happens to cover the link's centre. That is a layout accident
      // which moves with font metrics, so it differs per machine, not per engine.
      expect(
        await analyze(page, {
          include: captionDialog.dialogSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.standaloneDialogOpen);

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
    async ({page}) => {
      // Not LegacyBlocklyLab#gotoLevel: its waitForReady() dismisses the
      // instructions overlay, which also closes the video dialog under test.
      const lessonLevel = new LessonLevelPage(page);
      await lessonLevel.gotoLevel({
        lesson: 2,
        level: 1,
        noautoplay: false,
        forceYoutubeFallback: true,
      });
      // A maze lab: its #codeApp splash skews contrast until it finishes fading.
      await expect(new LegacyBlocklyLab(page).loadingSpinner).toBeHidden({
        timeout: 45_000,
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
      ).toEqual(EXPECTED_VIOLATIONS.mazeInitialLoad);

      await captionDialog.open();
      await expect(captionDialog.dialogHeading).toBeVisible();

      // Dialog-scoped for the same reason as the standalone case above.
      expect(
        await analyze(page, {
          include: captionDialog.dialogSelector,
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS.mazeDialogOpen);

      await captionDialog.close();
      await expect(captionDialog.dialogHeading).toBeHidden();
    },
  );
});
