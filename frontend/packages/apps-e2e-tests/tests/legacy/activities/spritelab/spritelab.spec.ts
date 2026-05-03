import {expect, test} from '@playwright/test';

import {SpriteLab} from './SpriteLab';

/**
 * Sprite Lab — lesson 36 of allthethingscourse, level 1.
 *
 * Source: dashboard/test/ui/features/star_labs/spritelab/spritelab.feature
 * All three scenarios: loading, losing, and winning the first level.
 */
test.describe('Sprite Lab — lesson 36 — level 1', () => {
  let spritelab: SpriteLab;

  test.beforeEach(async ({page}) => {
    spritelab = new SpriteLab(page);
    await spritelab.gotoLevel(1);
    await expect(spritelab.runButton).toBeVisible();
    await expect(spritelab.resetButton).toBeHidden();
  });

  /**
   * Source: spritelab.feature "Loading the first level"
   * Verifies the sprite avatar image is present on page load.
   */
  test('loading the first level shows the sprite avatar', async () => {
    await expect(spritelab.spriteAvatarImage).toBeVisible();
  });

  /**
   * Source: spritelab.feature "Losing the first level"
   * Runs without changes, expects inline feedback, then resets.
   */
  test('losing the first level shows inline feedback', async () => {
    await spritelab.run();
    await expect(spritelab.resetButton).toBeVisible();
    await expect(spritelab.inlineFeedback).toBeVisible();
    await expect(spritelab.inlineFeedback).toHaveText(
      "Keep coding! Something's not quite right yet.",
    );
    await spritelab.reset();
    await expect(spritelab.runButton).toBeVisible();
    await expect(spritelab.resetButton).toBeHidden();
  });

  /**
   * Source: spritelab.feature "Winning the first level" @no_mobile
   * Selects a sprite type from the make-new-sprite block dropdown, then runs.
   */
  test(
    'winning the first level shows congrats',
    {tag: '@no_mobile'},
    async () => {
      await spritelab.clickBlockFieldAt(
        "[data-id='make-new-sprite'] > .blocklyEditableField",
        1,
      );
      await spritelab.selectDropdownItem(0);
      await spritelab.run();
      await expect(spritelab.congratsMessage).toBeVisible();
    },
  );
});
