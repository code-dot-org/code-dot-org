import {createStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';
import {Bee} from '../activities/bee/Bee';

/**
 * Fun-O-Meter: puzzle rating UI.
 *
 * Source: dashboard/test/ui/features/teacher_tools/fun_o_meter.feature
 *
 * Verifies that the puzzle rating buttons (#puzzleRatingButtons) appear when
 * a student solves lesson 4, level 4 of allthethingscourse, persist across a
 * page reload, disappear after the student rates the puzzle and continues to
 * the next level, and do not reappear when the student returns to the same
 * level.
 */

/** Lesson 4, level 4 of allthethingscourse — the bee conditional puzzle. */
const LEVEL_4 =
  '/courses/allthethingscourse/units/1/lessons/4/levels/4?noautoplay=true';

/**
 * Minimal working solution for the bee conditional puzzle (level 4/4).
 * Source: blockly_initialization_blocks.rb — `I've initialized the workspace
 * with bee conditional blocks`.
 * Structure: repeat 3 × moveForward, then if nectarRemaining == 1 collect nectar.
 */
const BEE_CONDITIONAL_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'controls_repeat_dropdown',
            fields: {TIMES: '<field name="TIMES" config="3-10">3</field>'},
            inputs: {DO: {block: {type: 'maze_moveForward'}}},
            next: {
              block: {
                type: 'bee_ifNectarAmount',
                fields: {
                  ARG1: '<field name="ARG1">nectarRemaining</field>',
                  OP: '<field name="OP">==</field>',
                  ARG2: '1',
                },
                inputs: {DO: {block: {type: 'maze_nectar'}}},
              },
            },
          },
        },
      },
    ],
  },
};

test.describe('Fun-O-Meter', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/fun_o_meter.feature
   * Scenario: Rate a Puzzle
   */
  test(
    'rating buttons appear on solve, persist on reload, clear after rating',
    {tag: '@no_mobile'},
    async ({page}) => {
      await createStudent(page);
      const lab = new Bee(page);

      await page.goto(LEVEL_4);
      await lab.waitForLabPage();
      await lab.loadBlocks(BEE_CONDITIONAL_BLOCKS);
      await lab.runButton.click();
      await expect(page.locator('.congrats')).toBeVisible({timeout: 30_000});
      await expect(page.locator('#puzzleRatingButtons')).toBeVisible();

      // Reload: rating buttons must still appear (not yet rated).
      await page.reload();
      await lab.waitForLabPage();
      await lab.loadBlocks(BEE_CONDITIONAL_BLOCKS);
      await lab.runButton.click();
      await expect(page.locator('.congrats')).toBeVisible({timeout: 30_000});
      await expect(page.locator('#puzzleRatingButtons')).toBeVisible();

      // Rate the puzzle and continue to the next level.
      await page.locator('#like').click();
      await page.locator('#continue-button').click();

      // Server clears the pending puzzleRatings entry in localStorage once it
      // has persisted the rating.
      await page.waitForURL(/lessons\/4\/levels\/5/, {timeout: 30_000});
      await page.waitForFunction(
        () => localStorage.getItem('puzzleRatings') === '[]',
        {timeout: 15_000},
      );

      // Return to the same puzzle: rating buttons must NOT appear again.
      await page.goto(LEVEL_4);
      await lab.waitForLabPage();
      await lab.loadBlocks(BEE_CONDITIONAL_BLOCKS);
      await lab.runButton.click();
      await expect(page.locator('.congrats')).toBeVisible({timeout: 30_000});
      await expect(page.locator('#puzzleRatingButtons')).not.toBeAttached();
    },
  );
});
