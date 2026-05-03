import {expect, test} from '@playwright/test';

import {Match} from './Match';

/**
 * Match level type — lesson 11 of allthethingscourse.
 *
 * Sources:
 *   dashboard/test/ui/features/teacher_tools/level_types/match.feature
 *
 * Scenarios 1 (loading) and 2 (solving) are anonymous.
 * Scenario 3 (submitting incorrect solution) requires @as_student auth — skipped.
 * All scenarios tagged @no_mobile per the source feature.
 */
test.describe('Match — lesson 11', () => {
  test('loading the level shows question text', async ({page}) => {
    // Source: match.feature "Loading the level"
    const match = new Match(page);
    await match.gotoLevel(1);
    await expect(match.questionText).toHaveText('Match the puzzles and blocks');
  });

  test(
    'solving all four answers shows correct modal',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Source: match.feature "Solving puzzle"
      // Dismiss the login reminder (sign-in callout) before dragging.
      const match = new Match(page);
      await match.gotoLevel(1);
      await match.dismissLoginReminderIfPresent();

      await match.dragAnswerToFirstSlot(0);
      await match.dragAnswerToFirstSlot(1);
      await match.dragAnswerToFirstSlot(2);
      await match.dragAnswerToFirstSlot(3);

      await match.submit();
      await expect(match.modalTitle).toContainText('Correct');
    },
  );
});
