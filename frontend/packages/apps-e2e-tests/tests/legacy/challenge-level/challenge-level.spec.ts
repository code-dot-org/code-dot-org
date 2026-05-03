import {test} from '@playwright/test';

import {ChallengeLevel} from './ChallengeLevel';

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
  let maze: ChallengeLevel;

  test.beforeEach(async ({page}) => {
    maze = new ChallengeLevel(page);
    await maze.gotoLevel(6);
  });

  test('submit passing then perfect solution shows correct dialogs', async () => {
    // On load the challenge panel appears with the initial prompt.
    await maze.expectChallengeTitle('Challenge Puzzle!');

    // Accept the challenge.
    await maze.challengePrimaryButton.click();

    // Connect the two blocks to form a passing solution.
    await maze.connectBlock('stoneTurn', 'stoneMoveTop');
    await maze.run();

    await maze.expectChallengeTitle('You did it!');

    // Dismiss the "You did it!" modal and reset.
    await maze.challengeCancelButton.click();
    await maze.modalBody.waitFor({state: 'hidden'});
    await maze.reset();

    // Delete the extra block and run again for a perfect solution.
    await maze.disposeBlock('extraBlock');
    await maze.run();

    await maze.expectChallengeTitle('Challenge Complete!');
  });

  test('skip button navigates to the next level', async ({page}) => {
    await maze.challengePrimaryButton.click();
    await maze.clickSkipButton();
    await page.waitForURL(/\/lessons\/2\/levels\/7/);
  });
});
