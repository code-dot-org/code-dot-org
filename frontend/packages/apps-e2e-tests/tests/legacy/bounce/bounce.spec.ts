import {expect, test} from '@playwright/test';

import {
  LEVEL_1_BOUNCE_BLOCKS,
  LEVEL_3_BOUNCE_BLOCKS,
  LEVEL_5_BOUNCE_BLOCKS,
} from './blocks';
import {BounceLab} from './BounceLab';

test.describe('Bounce — level 1', () => {
  let bounce: BounceLab;

  test.beforeEach(async ({page}) => {
    bounce = new BounceLab(page);
    await bounce.gotoLevel(1);
    await expect(bounce.runButton).toBeVisible();
    await expect(bounce.resetButton).toBeHidden();
  });

  test('winning solution with left-key hold completes the puzzle', async () => {
    await bounce.loadBlocks(LEVEL_1_BOUNCE_BLOCKS);
    await bounce.run();
    await bounce.holdKey('ArrowLeft');

    await expect(bounce.congratsMessage).toBeVisible();
    await expect(bounce.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 1.',
    );

    await bounce.releaseKey('ArrowLeft');
  });
});

test.describe('Bounce — level 3', () => {
  let bounce: BounceLab;

  test.beforeEach(async ({page}) => {
    bounce = new BounceLab(page);
    await bounce.gotoLevel(3);
    await expect(bounce.runButton).toBeVisible();
    await expect(bounce.resetButton).toBeHidden();
  });

  test('winning solution with up-key hold completes the puzzle', async () => {
    await bounce.loadBlocks(LEVEL_3_BOUNCE_BLOCKS);
    await bounce.run();
    await bounce.holdKey('ArrowUp');

    await expect(bounce.congratsMessage).toBeVisible();
    await expect(bounce.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 3.',
    );

    await bounce.releaseKey('ArrowUp');
  });
});

test.describe('Bounce — level 5', () => {
  let bounce: BounceLab;

  test.beforeEach(async ({page}) => {
    bounce = new BounceLab(page);
    await bounce.gotoLevel(5);
    await expect(bounce.runButton).toBeVisible();
    await expect(bounce.resetButton).toBeHidden();
  });

  test(
    'run with no blocks shows inline feedback',
    {tag: '@no_mobile'},
    async () => {
      await bounce.run();

      await expect(bounce.inlineFeedback).toBeVisible();
      await expect(bounce.resetButton).toBeVisible();
      // ' is RIGHT SINGLE QUOTATION MARK; the app emits it instead of U+0027 APOSTROPHE
      await expect(bounce.inlineFeedback).toHaveText(
        'Not quite. You have to use a block you aren’t using yet.',
      );
    },
  );

  test('winning solution completes the puzzle', async () => {
    await bounce.loadBlocks(LEVEL_5_BOUNCE_BLOCKS);
    await bounce.run();

    await expect(bounce.congratsMessage).toBeVisible();
    await expect(bounce.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 5.',
    );
  });
});

test.describe('Bounce — freeplay level 10', () => {
  let bounce: BounceLab;

  test.beforeEach(async ({page}) => {
    bounce = new BounceLab(page);
    await bounce.gotoLevel(10);
    await expect(bounce.runButton).toBeVisible();
    await expect(bounce.finishButton).toBeHidden();
  });

  test('finish button appears after run and completes freeplay', async () => {
    await bounce.run();

    await expect(bounce.finishButton).toBeVisible();
    await bounce.finish();

    await expect(bounce.congratsMessage).toBeVisible();
  });
});
