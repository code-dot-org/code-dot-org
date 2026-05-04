import {expect, test} from '../../shared/fixtures';
import {createTeacherAssociatedStudent} from '../../shared/auth';

/**
 * BubbleChoice level type — lessons 40 and 52 of allthethingscourse unit 1.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/level_types/bubble_choice.feature
 *
 * Scenarios 1 and 2 are tagged @properties_encryption_key — they require a
 * server-side encryption key not present in the test environment and are
 * therefore marked fixme.
 *
 * Scenario 3 ("Navigating between a Lab2 sublevel and another Lab2 level")
 * does not require the encryption key and is fully ported.
 */

test.describe('BubbleChoice — progress tracking', () => {
  test.fixme(
    'viewing BubbleChoice progress (@properties_encryption_key required)',
    // Source: bubble_choice.feature "Viewing BubbleChoice progress"
    // Skipped: requires @properties_encryption_key not available in test env.
    async () => {},
  );

  test.fixme(
    'Lab2 BubbleChoice progress (@properties_encryption_key required)',
    // Source: bubble_choice.feature "Lab2 BubbleChoice progress"
    // Skipped: requires @properties_encryption_key not available in test env.
    async () => {},
  );
});

// ─── Scenario 3 — navigate between Lab2 sublevel and another Lab2 level ──────

test.describe('BubbleChoice — Lab2 sublevel navigation', () => {
  test(
    'navigating from Lab2 sublevel to another level and back',
    async ({page}) => {
      // Source: bubble_choice.feature "Navigating between a Lab2 sublevel and another Lab2 level"
      await createTeacherAssociatedStudent(page);

      // Navigate to Lab2 BubbleChoice sublevel.
      const sublevelUrl =
        '/courses/allthethingscourse/units/1/lessons/52/levels/8/sublevel/1';
      await page.goto(sublevelUrl);

      // Dismiss the instructions dialog if it appears.
      const closeBtn = page.locator('#ui-close-dialog');
      await closeBtn
        .waitFor({state: 'visible', timeout: 10_000})
        .catch(() => {/* dialog may not appear */});
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await closeBtn.waitFor({state: 'hidden', timeout: 10_000});
      }

      // Click the 6th progress bubble (0-indexed :eq(5)) to navigate to
      // another Lab2 level (panels — lesson 52 level 6).
      await page.locator('.progress-bubble').nth(5).click();
      await page
        .locator('#lab2-panels')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page).toHaveURL(
        /\/courses\/allthethingscourse\/units\/1\/lessons\/52\/levels\/6/,
      );

      // Navigate back — should return to the sublevel.
      await page.goBack();
      await page
        .locator('#lab2-aichat')
        .waitFor({state: 'visible', timeout: 30_000});
      await expect(page).toHaveURL(
        /\/courses\/allthethingscourse\/units\/1\/lessons\/52\/levels\/8\/sublevel\/1/,
      );
    },
  );
});
