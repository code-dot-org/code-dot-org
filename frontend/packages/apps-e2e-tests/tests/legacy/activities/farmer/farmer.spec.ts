import {expect, test} from '@playwright/test';

import {LOSING_FARMER_BLOCKS, WINNING_FARMER_BLOCKS} from './blocks';
import {Farmer} from './Farmer';

test.describe('Farmer — level 1', () => {
  let farmer: Farmer;

  test.beforeEach(async ({page}) => {
    farmer = new Farmer(page);
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

test.describe('Contextual hints — Farmer level 2', () => {
  let farmer: Farmer;

  test.beforeEach(async ({page}) => {
    farmer = new Farmer(page);
    await farmer.gotoLevel(2);
  });

  test(
    'running with default workspace adds a contextual hint and renders a block visual',
    {tag: '@no_mobile'},
    async () => {
      // Level 2 starts with 3 authored hints. Running the default workspace
      // (no fill block) triggers feedback and prepends a contextual hint,
      // bringing the total to 4.
      await farmer.run();
      await expect(farmer.inlineFeedback).toBeVisible();
      await expect(farmer.hintCount).toHaveText('4');

      // The contextual hint renders a block visual inside the panel.
      await farmer.lightbulb.click();
      await farmer.acceptHint();
      await expect(farmer.instructionsPanel).toContainText(
        'Try using a block like this to solve the puzzle.',
      );
      await expect(
        farmer.instructionsPanel.locator('.block-space'),
      ).toBeVisible();
    },
  );
});

test.describe('Authored hints — Farmer level 2', () => {
  let farmer: Farmer;

  test.beforeEach(async ({page}) => {
    farmer = new Farmer(page);
    await farmer.gotoLevel(2);
  });

  test('lightbulb is visible and shows 3 hints available', async () => {
    await expect(farmer.lightbulb).toBeVisible();
    await expect(farmer.hintCount).toHaveText('3');
  });

  test('viewing all 3 hints decrements counter then removes it', async () => {
    // Hint 1 — text includes basic markup
    await farmer.lightbulb.click();
    await farmer.acceptHint();
    await expect(farmer.instructionsPanel).toContainText(
      'This is the first hint.',
    );
    await expect(farmer.instructionsPanel).toContainText(
      'It has some basic markup',
    );
    await expect(farmer.hintCount).toHaveText('2');

    // Hint 2 — rendered with a hint video; an img element appears inside the panel
    await farmer.lightbulb.click();
    await farmer.acceptHint();
    await expect(farmer.instructionsPanel).toContainText(
      'This is the second hint. It has a hint video.',
    );
    // Immersive Reader icon is also an img; target the hint video thumbnail specifically
    await expect(
      farmer.instructionsPanel.locator('img[src*="farmer_intro"]'),
    ).toBeVisible();
    await expect(farmer.hintCount).toHaveText('1');

    // Hint 3 — counter element removed from DOM after last hint
    await farmer.lightbulb.click();
    await farmer.acceptHint();
    await expect(farmer.instructionsPanel).toContainText(
      'This is the third and final hint.',
    );
    await expect(farmer.hintCount).not.toBeAttached();
  });

  test('clicking lightbulb after all hints shows no further prompt', async () => {
    for (let i = 0; i < 3; i++) {
      await farmer.lightbulb.click();
      await farmer.acceptHint();
    }
    await expect(farmer.hintCount).not.toBeAttached();

    await farmer.lightbulb.click();
    // Prompt must not appear after hints are exhausted
    await expect(
      farmer.page.getByRole('button', {name: 'Yes', exact: true}),
    ).not.toBeAttached();
  });
});
