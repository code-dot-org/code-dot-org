import {expect, test} from '@playwright/test';

import {LegacyBlocklyLab} from '../../pages/legacy-blockly-lab';

import {WINNING_BEE_BLOCKS} from './blocks';

test.describe('Bee — level 4', () => {
  let bee: LegacyBlocklyLab;

  test.beforeEach(async ({page}) => {
    bee = new LegacyBlocklyLab(page);
    await bee.gotoLevel({lesson: 4, level: 4});
    await bee.dismissLoginReminder();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/star_labs/bee.feature "Complete Bee Conditions 4-5 Level 3"
   */
  test('winning solution completes the puzzle', async () => {
    await bee.loadBlocks(WINNING_BEE_BLOCKS);
    await bee.run();

    // .congrats is the direct signal; #feedback-dialog ancestor has offsetParent
    // null — assert on the descendant, not the container.
    await expect(bee.feedbackDialog.congratsMessage).toBeVisible();
    await expect(bee.feedbackDialog.congratsMessage).toHaveText(
      'Congratulations! You completed Puzzle 4.',
    );
  });
});
