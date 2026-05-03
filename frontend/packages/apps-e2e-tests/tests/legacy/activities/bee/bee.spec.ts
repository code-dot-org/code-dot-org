import {expect, test} from '@playwright/test';

import {Bee} from './Bee';
import {RECOMMENDED_BEE_LEVEL_5_BLOCKS, WINNING_BEE_BLOCKS} from './blocks';

test.describe('Bee — level 4', () => {
  let bee: Bee;

  test.beforeEach(async ({page}) => {
    bee = new Bee(page);
    await bee.gotoLevel(4);
  });

  test('winning solution completes the puzzle', async () => {
    await expect(bee.runButton).toBeVisible();
    await expect(bee.resetButton).toBeHidden();

    await bee.loadBlocks(WINNING_BEE_BLOCKS);
    await bee.run();

    await expect(bee.congratsMessage).toBeVisible();
    await expect(bee.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 4.',
    );
  });
});

test.describe('Feedback — Bee level 5', () => {
  let bee: Bee;

  test.beforeEach(async ({page}) => {
    bee = new Bee(page);
    await bee.gotoLevel(5);
  });

  test('suboptimal solution shows feedback; hint request reveals blocks panel', async () => {
    await bee.run();

    await expect(bee.congratsMessage).toBeVisible();
    await expect(bee.congratsMessage).toContainText(
      'But you could use a different block',
    );
    await expect(bee.hintRequestButton).toBeVisible();

    // After clicking the hint-request button the congrats text is replaced
    // with a prompt to try the recommended blocks.
    await bee.hintRequestButton.click();
    await expect(bee.congratsMessage).toHaveText(
      'Try using one of the blocks below:',
    );
    await expect(bee.feedbackBlocks).toBeVisible();
  });

  test('recommended solution passes without feedback prompt', async () => {
    await bee.loadBlocks(RECOMMENDED_BEE_LEVEL_5_BLOCKS);
    await bee.run();

    await expect(bee.congratsMessage).toBeVisible();
    await expect(bee.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 5.',
    );
    await expect(bee.hintRequestButton).not.toBeAttached();
  });
});
