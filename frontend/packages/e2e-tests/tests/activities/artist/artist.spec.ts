import {expect, test} from '@playwright/test';

import {LegacyBlocklyLab} from '../../pages/legacy-blockly-lab';

import {LOSING_ARTIST_BLOCKS, WINNING_ARTIST_BLOCKS} from './blocks';

test.describe('Playing the Artist Game', () => {
  let artist: LegacyBlocklyLab;

  test.beforeEach(async ({page}) => {
    artist = new LegacyBlocklyLab(page);
    await artist.gotoLevel({lesson: 3, level: 2});
    await artist.dismissLoginReminder();
    await expect(artist.runButton).toBeVisible();
    await expect(artist.resetButton).toBeHidden();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist.feature "Loading the first level"
   */
  test('Loading the first level', async ({page}) => {
    // On load the lab renders its intro-video thumbnail and the turtle avatar,
    // matched by asset path. Presence in the DOM is the signal, so assert the
    // image is attached rather than checking an exact count.
    await expect(
      page.locator('img[src*="video_thumbnails/C2_artist_intro"]').first(),
    ).toBeAttached();
    await expect(
      page.locator('img[src*="artist/small_static_avatar"]').first(),
    ).toBeAttached();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist.feature "Winning the first level"
   */
  test('Winning the first level', async ({page}) => {
    await artist.loadBlocks(WINNING_ARTIST_BLOCKS);
    await artist.run();

    await expect(artist.resetButton).toBeVisible();
    await expect(artist.congratsMessage).toBeVisible();

    await artist.continue();
    await expect(page).toHaveURL(
      url =>
        url.pathname ===
        '/courses/allthethingscourse/units/1/lessons/3/levels/3',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/artist.feature "Losing the first level"
   */
  test('Losing the first level', async () => {
    await artist.loadBlocks(LOSING_ARTIST_BLOCKS);
    await artist.run();

    await expect(artist.resetButton).toBeVisible();
    await expect(artist.inlineFeedback).toBeVisible();
    // U+2019 RIGHT SINGLE QUOTATION MARK in "aren’t", verified live against studio.code.org.
    await expect(artist.inlineFeedback).toHaveText(
      'Not quite. Try using a block you aren’t using yet.',
    );

    await artist.reset();
    await expect(artist.runButton).toBeVisible();
    await expect(artist.resetButton).toBeHidden();
  });
});
