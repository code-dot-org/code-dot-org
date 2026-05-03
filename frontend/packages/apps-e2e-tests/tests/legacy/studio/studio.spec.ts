import {expect, test} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * PlayLab (studio) — sprite resize after run.
 *
 * Source: dashboard/test/ui/features/star_labs/studio.feature
 * Scenario: Resizing Sprites
 *
 * The level's program resizes the sprite images on the stage. Verify initial
 * heights before run and final heights after pressing again-button.
 */
test.describe('PlayLab — sprite resize', () => {
  test('sprites resize after running the program', async ({page}) => {
    await page.goto('/reset_session');
    await page.goto(labLevelUrl(22, 1));
    await page.locator('#runButton').waitFor({state: 'visible'});

    const sprites = page.locator('#spriteLayer image');
    await expect(sprites.nth(0)).toHaveAttribute('height', '100');
    await expect(sprites.nth(15)).toHaveAttribute('height', '100');

    await page.locator('#runButton').click();
    await page.locator('.congrats').waitFor({state: 'visible'});
    await page.locator('#again-button').click();

    await expect(sprites.nth(0)).toHaveAttribute('height', '50');
    await expect(sprites.nth(15)).toHaveAttribute('height', '150');
  });
});
