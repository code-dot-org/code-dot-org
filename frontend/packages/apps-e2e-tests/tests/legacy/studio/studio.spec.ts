import {expect, test} from '@playwright/test';

import {Studio} from './Studio';

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
    const studio = new Studio(page);
    await studio.gotoLevel(1);

    await expect(studio.sprites.nth(0)).toHaveAttribute('height', '100');
    await expect(studio.sprites.nth(15)).toHaveAttribute('height', '100');

    await studio.run();
    await expect(studio.congratsMessage).toBeVisible();
    await studio.tryAgain();

    await expect(studio.sprites.nth(0)).toHaveAttribute('height', '50');
    await expect(studio.sprites.nth(15)).toHaveAttribute('height', '150');
  });
});
