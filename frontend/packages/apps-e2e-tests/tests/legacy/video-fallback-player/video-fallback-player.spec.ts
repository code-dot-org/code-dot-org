import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';

const STANDALONE_URL =
  '/courses/allthethingscourse/units/1/lessons/34/levels/1?force_youtube_fallback=1';
const DIALOG_URL =
  '/courses/allthethingscourse/units/1/lessons/2/levels/1?force_youtube_fallback=1';

/**
 * Open the fallback player captions dialog and close it.
 *
 * @param page - current Playwright page
 * @param url - level URL with fallback player enabled
 */
async function expectFallbackCaptionsDialog(
  page: Page,
  url: string,
): Promise<void> {
  await page.goto(url, {waitUntil: 'domcontentloaded'});

  await expect(
    page.locator('.ui-test-fallback-player-caption-dialog-link'),
  ).toBeVisible({timeout: 30_000});

  await page.locator('.ui-test-fallback-player-caption-dialog-link').click();
  await page
    .locator('.ui-test-fallback-player-caption-dialog')
    .waitFor({state: 'visible'});

  await page.locator('.ui-test-fallback-player-caption-dialog-close').click();
  await page
    .locator('.ui-test-fallback-player-caption-dialog')
    .waitFor({state: 'hidden'});
}

test.describe('Fallback player caption dialog', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature
   * Scenario: Standalone level with fallback video player has captions popup
   */
  test(
    'standalone level with fallback video player has captions popup',
    {tag: '@no_mobile'},
    async ({page}) => {
      await expectFallbackCaptionsDialog(page, STANDALONE_URL);
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/video/fallback_player_caption_dialog_link.feature
   * Scenario: Level with fallback video player in dialog has captions popup
   */
  test(
    'level with dialog and fallback video player has captions popup',
    {tag: '@no_mobile'},
    async ({page}) => {
      await expectFallbackCaptionsDialog(page, DIALOG_URL);
    },
  );
});
