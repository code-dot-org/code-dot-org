import {expect, test} from '@playwright/test';

import {LOSING_FARMER_BLOCKS, WINNING_FARMER_BLOCKS} from './blocks';
import {FarmerLab} from './FarmerLab';

test.describe('Farmer — level 1', () => {
  let farmer: FarmerLab;

  test.beforeEach(async ({page}) => {
    farmer = new FarmerLab(page);
    await farmer.gotoLevel(1);
  });

  test('level renders the farmer avatar and pegman', async () => {
    await expect(farmer.farmerAvatar).toBeVisible();
    await expect(farmer.pegman).toBeVisible();
  });

  test('winning solution completes the puzzle and clears the dirt', async () => {
    await expect(farmer.runButton).toBeVisible();
    await expect(farmer.resetButton).toBeHidden();

    await farmer.loadBlocks(WINNING_FARMER_BLOCKS);
    await farmer.run();

    await expect(farmer.resetButton).toBeVisible();
    await expect(farmer.congratsMessage).toBeVisible();
    await expect(farmer.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 1.',
    );

    const dirt = await farmer.getDirtAt(3, 3);
    expect(dirt).toBe(0);

    await farmer.nextLevel();
    await farmer.waitForLevel(2);
  });

  test(
    'losing solution shows inline feedback',
    {tag: '@no_mobile'},
    async () => {
      await expect(farmer.runButton).toBeVisible();
      await expect(farmer.resetButton).toBeHidden();

      await farmer.loadBlocks(LOSING_FARMER_BLOCKS);
      await farmer.run();

      await expect(farmer.resetButton).toBeVisible();
      await expect(farmer.inlineFeedback).toBeVisible();
      // ' is RIGHT SINGLE QUOTATION MARK; the app emits it instead of U+0027 APOSTROPHE
      await expect(farmer.inlineFeedback).toHaveText(
        'Not quite. Try using a block you aren’t using yet.',
      );

      await farmer.reset();

      await expect(farmer.runButton).toBeVisible();
      await expect(farmer.resetButton).toBeHidden();
    },
  );
});

test.describe('Authored hints — Farmer level 2', () => {
  let farmer: FarmerLab;

  test.beforeEach(async ({page}) => {
    farmer = new FarmerLab(page);
    await farmer.gotoLevel(2);
  });

  test('lightbulb is visible and shows 3 hints available', async () => {
    await expect(farmer.lightbulb).toBeVisible();
    await expect(farmer.hintCount).toHaveText('3');
  });

  test('viewing all 3 hints decrements counter then removes it', async () => {
    // Hint 1
    await farmer.lightbulb.click();
    await farmer.acceptHint();
    await expect(farmer.instructionsPanel).toContainText(
      'This is the first hint.',
    );
    await expect(farmer.hintCount).toHaveText('2');

    // Hint 2
    await farmer.lightbulb.click();
    await farmer.acceptHint();
    await expect(farmer.instructionsPanel).toContainText(
      'This is the second hint.',
    );
    await expect(farmer.hintCount).toHaveText('1');

    // Hint 3 — counter element removed from DOM after last hint
    await farmer.lightbulb.click();
    await farmer.acceptHint();
    await expect(farmer.instructionsPanel).toContainText(
      'This is the third and final hint.',
    );
    await expect(farmer.hintCount).not.toBeAttached();
  });
});
