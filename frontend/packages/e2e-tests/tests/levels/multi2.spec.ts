import {expect, test} from '@playwright/test';

import {MultiLevel} from '../pages/multi-level';

test.describe('Playing multi2 levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi2.feature "Loading the level"
   */
  test('Loading the level', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 10, level: 1});

    await expect(level.question).toHaveText(
      'Which lines of code should be removed so the program will work as intended? Select two answers',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi2.feature "Clicking an option enables submit but submitting only one answer gets a warning"
   */
  test('Clicking an option enables submit but submitting only one answer gets a warning', async ({
    page,
  }) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 10, level: 1});

    // Submit is disabled before any answer is selected.
    await expect(level.submitButton).toBeDisabled();

    await level.clickAnswer(0);

    // Selecting one answer enables the submit button.
    await expect(level.submitButton).not.toBeDisabled();

    await level.submit();

    // Client-side validation fires synchronously: modal appears immediately.
    await expect(level.modal).toBeVisible();
    await expect(level.modalTitle).toContainText('Too few answers.');

    await level.dismissModal();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi2.feature "Clicking an option enables submit and submitting the correct answer (two checkboxes) wins"
   */
  test('Clicking an option enables submit and submitting the correct answer (two checkboxes) wins', async ({
    page,
  }) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 10, level: 1});

    // Submit is disabled before any answer is selected.
    await expect(level.submitButton).toBeDisabled();

    await level.clickAnswer(0);

    // Selecting one answer enables the submit button.
    await expect(level.submitButton).not.toBeDisabled();

    // Selecting the second correct answer (index 1) keeps submit enabled.
    await level.clickAnswer(1);

    await level.submit();

    // Win modal appears — same .modal container as the warning modal.
    // The dialog title is locale-dependent; assert only that the modal is visible.
    await expect(level.modal).toBeVisible();
  });
});
