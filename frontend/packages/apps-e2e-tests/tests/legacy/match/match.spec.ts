import {expect, test} from '../../shared/fixtures';

import {Match} from './Match';

/**
 * Waits for the milestone POST that persists a match submission.
 *
 * @param page - Playwright page on a match level
 */
async function waitForMilestonePost(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.waitForResponse(
    response =>
      response.request().method() === 'POST' &&
      response.url().includes('/milestone/') &&
      response.ok(),
    {timeout: 30_000},
  );
}

/**
 * Match level type — lesson 11 of allthethingscourse.
 *
 * Sources:
 *   dashboard/test/ui/features/teacher_tools/level_types/match.feature
 *
 * All scenarios tagged @no_mobile per the source feature.
 */
test.describe('Match — lesson 11', () => {
  test('loading the level shows question text', async ({page}) => {
    // Scenario: Loading the level
    const match = new Match(page);
    await match.gotoLevel(1);
    await expect(match.questionText).toHaveText('Match the puzzles and blocks');
  });

  test(
    'solving all four answers shows correct modal',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Scenario: Solving puzzle
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

// ─── Match — signed-in student, incorrect solution persisted on reload ────────

/**
 * Scenario: Submitting an incorrect solution
 * Requires a signed-in student (@as_student @no_mobile).
 * Drags answers in reverse order (wrong solution), submits, verifies the
 * xmark indicator, then reloads and confirms the server remembered the answers.
 */
test.describe('Match — incorrect solution persists', () => {
  test(
    'submitting incorrect solution shows xmark; answers reload from server',
    {tag: '@no_mobile'},
    async ({studentPage}) => {
      // Scenario: Submitting an incorrect solution
      const match = new Match(studentPage);
      await match.gotoLevel(1, {resetSession: false});

      // Verify 4 empty slots before starting.
      await expect(
        studentPage.locator('.match').nth(0).locator('.match_slots .emptyslot'),
      ).toHaveCount(4);

      // Drag answers in reverse order (incorrect solution).
      await match.dragAnswerToFirstSlot(3);
      await match.dragAnswerToFirstSlot(2);
      await match.dragAnswerToFirstSlot(1);
      await match.dragAnswerToFirstSlot(0);

      // All slots filled; no empty slots remain.
      await expect(
        studentPage.locator('.match').nth(0).locator('.match_slots .emptyslot'),
      ).toHaveCount(0);

      // Submit via the bottom (review) button and wait for modal.
      const submitPost = waitForMilestonePost(studentPage);
      await match.reviewButton.click();
      await submitPost;
      await expect(match.modal).toBeVisible();
      await expect(match.modalTitle).toContainText('Incorrect');
      await match.okButton.click();
      // Multiple .xmark elements exist (one per slot); at least the first should be visible.
      await expect(match.xmark.first()).toBeVisible();

      // Reload — server should restore the previously placed answers.
      await studentPage.reload();
      await match.submitButton.waitFor({state: 'visible'});

      // No empty slots — all four answers are placed.
      await expect(
        studentPage.locator('.match .match_slots .emptyslot'),
      ).toHaveCount(0);

      // Answers should be placed in reverse order (originalIndex 3,2,1,0).
      const slots = studentPage.locator('.match_slots .answer');
      await expect(slots.nth(0)).toHaveAttribute('originalIndex', '3');
      await expect(slots.nth(1)).toHaveAttribute('originalIndex', '2');
      await expect(slots.nth(2)).toHaveAttribute('originalIndex', '1');
      await expect(slots.nth(3)).toHaveAttribute('originalIndex', '0');
    },
  );
});
