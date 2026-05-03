import {expect, test} from '@playwright/test';

import {Maze} from '../activities/maze/Maze';

/**
 * Challenge level — passing/perfect/skip dialogs in a Maze challenge level.
 *
 * Source: dashboard/test/ui/features/teacher_tools/challenge_level.feature
 * Background: allthethingscourse/units/1/lessons/2/levels/6 (Maze level 6 — challenge type)
 *
 * Two scenarios:
 *   1. Passing solution shows "You did it!"; deleting the extra block gives "Challenge Complete!".
 *   2. Clicking the skip button navigates to the next level.
 */
test.describe('Challenge level — Maze level 6', () => {
  let maze: Maze;

  test.beforeEach(async ({page}) => {
    maze = new Maze(page);
    await maze.gotoLevel(6);
  });

  test('submit passing then perfect solution shows correct dialogs', async ({
    page,
  }) => {
    // On load the challenge panel appears with the initial prompt.
    await page.locator('#uitest-challenge-title').waitFor({state: 'visible'});
    await expect(page.locator('#uitest-challenge-title')).toHaveText(
      'Challenge Puzzle!',
    );

    // Accept the challenge.
    await page.locator('#challengePrimaryButton').click();

    // Connect the two blocks to form a passing solution.
    await maze.connectBlock('stoneTurn', 'stoneMoveTop');
    await maze.run();

    await page.locator('#uitest-challenge-title').waitFor({state: 'visible'});
    await expect(page.locator('#uitest-challenge-title')).toHaveText(
      'You did it!',
    );

    // Dismiss the "You did it!" modal and reset.
    await page.locator('#challengeCancelButton').click();
    await page.locator('.modal-body').waitFor({state: 'hidden'});
    await maze.reset();

    // Delete the extra block and run again for a perfect solution.
    await maze.disposeBlock('extraBlock');
    await maze.run();

    await page.locator('#uitest-challenge-title').waitFor({state: 'visible'});
    await expect(page.locator('#uitest-challenge-title')).toHaveText(
      'Challenge Complete!',
    );
  });

  test('skip button navigates to the next level', async ({page}) => {
    await page.locator('#challengePrimaryButton').click();
    // WebKit: #visualization overlaps #skipButton in the challenge dialog —
    // JS click bypasses browser hit-testing.
    await page.evaluate(() =>
      (document.querySelector('#skipButton') as HTMLElement)?.click(),
    );
    await page.waitForURL(/\/lessons\/2\/levels\/7/);
  });
});
