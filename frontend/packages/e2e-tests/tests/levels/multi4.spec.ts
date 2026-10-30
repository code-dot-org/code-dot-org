import {expect, test} from '@playwright/test';

import {MultiLevel} from '../pages/multi-level';

test.describe('Playing multi levels 4', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi4.feature "Submitting an incorrect option"
   */
  test('Submitting an incorrect option', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 10, level: 1});

    // Submit is disabled before any answer is selected.
    await expect(level.submitButton).toBeDisabled();

    await level.clickAnswer(2);
    await expect(level.submitButton).not.toBeDisabled();

    await level.clickAnswer(3);
    await level.submit();

    await expect(level.modal).toBeVisible();
    await expect(level.modalTitle).toContainText('Incorrect answer');

    await level.dismissModal();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi4.feature "Pressing three options unselects the oldest"
   */
  test('Pressing three options unselects the oldest', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 10, level: 1});

    await expect(level.submitButton).toBeDisabled();

    await level.clickAnswer(2);
    await expect(level.submitButton).not.toBeDisabled();

    await level.clickAnswer(1);
    await level.clickAnswer(0);
    await level.submit();

    await expect(level.modal).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi4.feature "Pressing an option again toggles it"
   */
  test('Pressing an option again toggles it', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 10, level: 1});

    await expect(level.submitButton).toBeDisabled();

    await level.clickAnswer(0);
    await expect(level.submitButton).not.toBeDisabled();

    // #checked_0 toggles via display on a descendant of the answer button, so
    // assert visibility rather than a class on the button itself.
    await expect(level.checkedMark(0)).toBeVisible();

    await level.clickAnswer(0);
    await expect(level.checkedMark(0)).toBeHidden();
  });
});
