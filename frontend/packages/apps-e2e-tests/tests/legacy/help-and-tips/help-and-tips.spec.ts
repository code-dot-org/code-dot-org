import {expect, test} from '../../shared/fixtures';

/**
 * Help & Tips tab — Circuit Playground documentation link.
 *
 * Source: dashboard/test/ui/features/teacher_tools/instructions/help_and_tips.feature
 *
 * On lesson 18 / level 18 of allthethingscourse (a Maker / Circuit Playground
 * level) the Help & Tips tab in the instructions panel contains a link to the
 * Circuit Playground reference guide.  Clicking the link opens the reference
 * guide inside an `iframe.instructions-container`.
 */

test.describe('Help and Tips', {tag: '@no_mobile'}, () => {
  /**
   * Source: "'Help & Tips' and 'Instruction' tabs are visible if the level
   * has a map reference"
   *
   * Verifies:
   *   - `.uitest-helpTab` is present and clickable.
   *   - After clicking, the editor column shows "Circuit Playground" as a link.
   *   - Clicking the link opens the documentation iframe.
   *   - The iframe contains `.documentation-ui-test` and the expected text.
   */
  test('help tab shows Circuit Playground documentation link that opens reference', async ({
    studentPage,
  }) => {
    await studentPage.goto(
      '/courses/allthethingscourse/units/1/lessons/18/levels/18',
    );
    await expect(studentPage.locator('.uitest-helpTab')).toBeVisible({
      timeout: 30_000,
    });

    await studentPage.locator('.uitest-helpTab').click();
    // Two .editor-column elements exist (instructions panel + code editor).
    // Circuit Playground link lives in the instructions panel — the first one.
    const instructionsPanel = studentPage.locator('.editor-column').first();
    await expect(instructionsPanel).toContainText('Circuit Playground', {
      timeout: 15_000,
    });

    await instructionsPanel
      .locator('a', {hasText: 'Circuit Playground'})
      .first()
      .click();

    // Documentation loads inside iframe.instructions-container.
    const frame = studentPage.frameLocator('iframe.instructions-container');
    await expect(frame.locator('.documentation-ui-test')).toBeVisible({
      timeout: 30_000,
    });
    await expect(frame.locator('.content')).toContainText(
      'Circuit Playground',
      {timeout: 15_000},
    );
    await expect(frame.locator('.content')).toContainText(
      'The Light Emitting Diode (LED)',
      {timeout: 15_000},
    );
  });
});
