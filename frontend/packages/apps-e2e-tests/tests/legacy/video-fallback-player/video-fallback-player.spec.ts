import {expect, test} from '../../shared/fixtures';

/**
 * Fallback video player caption dialog link — allthethingscourse lessons 34 and 2.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature
 *
 * Both scenarios tagged @no_mobile; anonymous, no auth required.
 * Uses ?force_youtube_fallback=1 to activate the VideoJS fallback player.
 */

const STANDALONE_URL =
  '/courses/allthethingscourse/units/1/lessons/34/levels/1?force_youtube_fallback=1';
const DIALOG_URL =
  '/courses/allthethingscourse/units/1/lessons/2/levels/1?force_youtube_fallback=1';

test.describe('Fallback player caption dialog', () => {
  for (const [name, url] of [
    ['standalone level', STANDALONE_URL],
    ['level with dialog', DIALOG_URL],
  ] as const) {
    test(
      `${name} with fallback video player has captions popup`,
      {tag: '@no_mobile'},
      async ({page}) => {
        await page.goto(url);
        await page
          .locator('.vjs-big-play-button')
          .waitFor({state: 'visible', timeout: 30_000});

        await expect(
          page.locator('.ui-test-fallback-player-caption-dialog-link'),
        ).toBeVisible();

        await page
          .locator('.ui-test-fallback-player-caption-dialog-link')
          .click();
        await page
          .locator('.ui-test-fallback-player-caption-dialog')
          .waitFor({state: 'visible'});

        await page
          .locator('.ui-test-fallback-player-caption-dialog-close')
          .click();
        await page
          .locator('.ui-test-fallback-player-caption-dialog')
          .waitFor({state: 'hidden'});
      },
    );
  }
});
