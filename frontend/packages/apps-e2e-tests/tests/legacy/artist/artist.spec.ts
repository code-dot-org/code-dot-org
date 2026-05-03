import {expect, test} from '@playwright/test';

import {ArtistLab} from './ArtistLab';
import {LOSING_ARTIST_BLOCKS, WINNING_ARTIST_BLOCKS} from './blocks';

test.describe('Artist — level 2', () => {
  let artist: ArtistLab;

  test.beforeEach(async ({page}) => {
    artist = new ArtistLab(page);
    await artist.gotoLevel(2);
  });

  test('level renders the artist avatar and video thumbnail', async () => {
    await expect(artist.artistAvatar).toBeVisible();
    await expect(artist.videoThumbnail).toBeVisible();
  });

  test(
    'winning solution completes the puzzle and advances to level 3',
    {tag: '@no_mobile'},
    async () => {
      await expect(artist.runButton).toBeVisible();
      await expect(artist.resetButton).toBeHidden();

      await artist.loadBlocks(WINNING_ARTIST_BLOCKS);
      await artist.run();

      await expect(artist.congratsMessage).toBeVisible();
      await expect(artist.congratsMessage).toHaveText(
        'Congratulations! You completed Puzzle 2.',
      );

      await artist.nextLevel();
      await artist.waitForLevel(3);
    },
  );

  test(
    'losing solution shows inline feedback',
    {tag: '@no_mobile'},
    async () => {
      await expect(artist.runButton).toBeVisible();
      await expect(artist.resetButton).toBeHidden();

      await artist.loadBlocks(LOSING_ARTIST_BLOCKS);
      await artist.run();

      await expect(artist.inlineFeedback).toBeVisible();
      await expect(artist.resetButton).toBeVisible();
      // ' is RIGHT SINGLE QUOTATION MARK; the app emits it instead of U+0027 APOSTROPHE
      await expect(artist.inlineFeedback).toHaveText(
        'Not quite. Try using a block you aren’t using yet.',
      );

      await artist.reset();

      await expect(artist.runButton).toBeVisible();
      await expect(artist.resetButton).toBeHidden();
    },
  );
});
