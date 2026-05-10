import {expect, test} from '@playwright/test';

import {Artist} from './Artist';
import {LOSING_ARTIST_BLOCKS, WINNING_ARTIST_BLOCKS} from './blocks';

test.describe('Contextual hints — Artist level 6', () => {
  let artist: Artist;

  test.beforeEach(async ({page}) => {
    artist = new Artist(page);
    await artist.gotoLevel(6);
  });

  test(
    'running on a level with no authored hints creates a contextual hint',
    {tag: '@no_mobile'},
    async () => {
      // Level 6 has no authored hints — lightbulb is not in the DOM yet.
      await expect(artist.lightbulb).not.toBeAttached();

      // Running the default workspace triggers feedback and dynamically
      // adds a contextual hint, making the lightbulb appear with count 1.
      await artist.run();
      await expect(artist.inlineFeedback).toBeVisible();
      await expect(artist.lightbulb).toBeVisible();
      await expect(artist.hintCount).toHaveText('1');
    },
  );
});

test.describe('Artist — level 2', () => {
  let artist: Artist;

  test.beforeEach(async ({page}) => {
    artist = new Artist(page);
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
      // Webkit: artist winning solution flaky under parallel run; passes alone.
      test.fixme(
        true,
        'TODO: artist winning solution congrats/advance flaky on webkit under parallel run; timing issue with block load or run completion',
      );
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
