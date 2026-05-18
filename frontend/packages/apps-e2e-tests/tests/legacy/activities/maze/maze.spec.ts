import {expect, test} from '../../../shared/fixtures';

import {
  EMPTY_REPEAT_MAZE_BLOCKS,
  INCORRECT_MAZE_BLOCKS,
  TOO_MANY_MAZE_BLOCKS,
  VALID_MAZE_BLOCKS,
} from './blocks';
import {Maze} from './Maze';

test.describe('Maze — level 5', () => {
  let maze: Maze;

  test.beforeEach(async ({page}) => {
    maze = new Maze(page);
    await maze.gotoLevel(5);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maze.feature
   * Scenario: Submit an invalid solution
   */
  test(
    'run with no blocks shows inline feedback',
    {tag: '@no_mobile'},
    async () => {
      await expect(maze.instructions).toHaveText(
        'Use the if block to help me decide when to turn. ',
      );
      await expect(maze.runButton).toBeVisible();
      await expect(maze.resetButton).toBeHidden();

      await maze.runUntilInlineFeedback();

      await expect(maze.runButton).toBeHidden();
      await expect(maze.resetButton).toBeVisible();
      await expect(maze.inlineFeedback).toBeVisible();

      await maze.reset();

      await expect(maze.runButton).toBeVisible();
      await expect(maze.resetButton).toBeHidden();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maze.feature
   * Scenario: Submit a valid solution
   */
  test(
    'valid solution completes the level and advances to level 6',
    {tag: '@no_mobile'},
    async () => {
      await expect(maze.resetButton).toBeHidden();
      await maze.loadBlocks(VALID_MAZE_BLOCKS);
      await maze.waitForFiveBlockWorkspace();

      await maze.runUntilCongrats();

      await expect(maze.congratsMessage).toBeVisible();
      await expect(maze.congratsMessage).toHaveText(
        'Congratulations! You completed Puzzle 5.',
      );

      await maze.nextLevel();
      await maze.waitForLevel(6);

      // Navigate back to verify the solution persists across sessions.
      await maze.reloadLevel(5);

      await maze.runUntilCongrats();

      await expect(maze.congratsMessage).toBeVisible();
      await expect(maze.congratsMessage).toHaveText(
        'Congratulations! You completed Puzzle 5.',
      );
    },
  );
});

test.describe('Maze — level 4', () => {
  let maze: Maze;

  test.beforeEach(async ({page}) => {
    maze = new Maze(page);
    await maze.gotoLevel(4);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maze2.feature
   * Scenario: Submit an incorrect program missing a block
   */
  test(
    'incorrect solution shows inline feedback',
    {tag: '@no_mobile'},
    async () => {
      await expect(maze.instructions).toHaveText(
        'Use the "repeat" block to solve the puzzle quickly...',
      );
      await expect(maze.runButton).toBeVisible();
      await expect(maze.resetButton).toBeHidden();

      await maze.loadBlocks(INCORRECT_MAZE_BLOCKS);
      await maze.runUntilInlineFeedback();

      await expect(maze.inlineFeedback).toBeVisible();
      await expect(maze.runButton).toBeHidden();
      await expect(maze.resetButton).toBeVisible();
      // ' is RIGHT SINGLE QUOTATION MARK; the app emits it instead of U+0027 APOSTROPHE
      await expect(maze.inlineFeedback).toHaveText(
        'Not quite. Try using a block you aren’t using yet.',
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maze2.feature
   * Scenario: Submit a program with an empty repeat
   */
  test('empty repeat block shows inner-block error', async () => {
    await expect(maze.runButton).toBeVisible();
    await expect(maze.resetButton).toBeHidden();

    await maze.loadBlocks(EMPTY_REPEAT_MAZE_BLOCKS);
    await maze.runUntilInlineFeedback();

    await expect(maze.inlineFeedback).toBeVisible();
    await expect(maze.runButton).toBeHidden();
    await expect(maze.resetButton).toBeVisible();
    await expect(maze.inlineFeedback).toHaveText(
      'The "Repeat" or "If" block needs to have other blocks inside it to work. Make sure the inner block fits properly inside the containing block.',
    );

    await maze.reset();

    await expect(maze.runButton).toBeVisible();
    await expect(maze.resetButton).toBeHidden();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/maze2.feature
   * Scenario: Submit a working program that uses too many blocks
   */
  test('working solution with too many blocks shows suboptimal-use hint', async () => {
    await expect(maze.runButton).toBeVisible();
    await expect(maze.resetButton).toBeHidden();

    await maze.loadBlocks(TOO_MANY_MAZE_BLOCKS);
    await maze.runUntilCongrats();

    await expect(maze.congratsMessage).toBeVisible();
    await expect(maze.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 4. (However, you could have used only 3 blocks.)',
    );

    await maze.tryAgain();
    await maze.reset();

    await expect(maze.runButton).toBeVisible();
    await expect(maze.resetButton).toBeHidden();
  });
});
