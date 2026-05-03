import {expect, test} from '@playwright/test';

import {LEVEL_1_FLAPPY_BLOCKS, LEVEL_2_FLAPPY_BLOCKS} from './blocks';
import {FlappyLab} from './FlappyLab';

test.describe('Flappy — level 1', () => {
  let flappy: FlappyLab;

  test.beforeEach(async ({page}) => {
    flappy = new FlappyLab(page);
    await flappy.gotoLevel(1);
  });

  test('winning solution with inverted gravity completes the puzzle', async () => {
    await expect(flappy.runButton).toBeVisible();
    await expect(flappy.resetButton).toBeHidden();

    await flappy.loadBlocks(LEVEL_1_FLAPPY_BLOCKS);
    await flappy.run();
    // Negative gravity makes the bird float upward past all pipes in one flap.
    await flappy.setGravity(-1);
    await flappy.flap();

    await expect(flappy.congratsMessage).toBeVisible();
    await expect(flappy.congratsMessage).toContainText(
      'You completed Puzzle 1',
    );
  });
});

test.describe('Flappy — level 2', () => {
  let flappy: FlappyLab;

  test.beforeEach(async ({page}) => {
    flappy = new FlappyLab(page);
    await flappy.gotoLevel(2);
  });

  test('winning solution completes the puzzle', async () => {
    await expect(flappy.runButton).toBeVisible();
    await expect(flappy.resetButton).toBeHidden();

    await flappy.loadBlocks(LEVEL_2_FLAPPY_BLOCKS);
    await flappy.run();
    await flappy.flap();

    await expect(flappy.congratsMessage).toBeVisible();
    await expect(flappy.congratsMessage).toContainText(
      'You completed Puzzle 2',
    );
  });

  test(
    'run with no blocks shows inline feedback',
    {tag: '@no_mobile'},
    async () => {
      await expect(flappy.runButton).toBeVisible();
      await expect(flappy.resetButton).toBeHidden();

      await flappy.run();
      await flappy.flap();

      await expect(flappy.inlineFeedback).toBeVisible();
      // ' is RIGHT SINGLE QUOTATION MARK; the app emits it instead of U+0027 APOSTROPHE
      await expect(flappy.inlineFeedback).toHaveText(
        'Not quite. You have to use a block you aren’t using yet.',
      );
    },
  );
});
