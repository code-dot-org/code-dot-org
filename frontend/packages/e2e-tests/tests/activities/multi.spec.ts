import {expect, test} from '@playwright/test';

import {MultiLab} from '../pages/multi-lab';
import {rotateLandscape} from '../shared/viewport';

test.describe('Playing multi levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature "Loading the level"
   */
  test('Loading the level', async ({page}) => {
    const lab = new MultiLab(page);

    await lab.gotoLevel({lesson: 9, level: 1});

    await expect(lab.submitButton).toBeVisible();
    await expect(lab.question).toHaveText(
      'Which arrow gets the Flurb to the treasure?',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature "Clicking an option enables submit and submitting the correct answer wins"
   */
  test('Clicking an option enables submit and submitting the correct answer wins', async ({
    page,
  }) => {
    const lab = new MultiLab(page);

    await lab.gotoLevel({lesson: 9, level: 1});
    await rotateLandscape(page);

    await expect(lab.submitButton).toBeVisible();
    // Before any answer is selected, submit is disabled (single button; :first and :last both resolve to it).
    await expect(lab.submitButton.first()).toBeDisabled();
    await expect(lab.submitButton.last()).toBeDisabled();

    // Answer index 1 is the correct answer.
    await lab.clickAnswer(1);

    // Submit enabled after answer selection.
    await expect(lab.submitButton.first()).not.toBeDisabled();
    await expect(lab.submitButton.last()).not.toBeDisabled();

    await lab.submit();

    // Correct-answer modal appears (server-gated: waits for milestone POST).
    await expect(lab.modal).toBeVisible();
    await expect(lab.modalTitle).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature "Submitting an incorrect option"
   */
  test('Submitting an incorrect option', async ({page}) => {
    const lab = new MultiLab(page);

    // /lang/en-US is rewritten server-side to ?lang=en-US; pass literal URL.
    await lab.gotoUrl(
      '/courses/allthethingscourse/units/1/lessons/9/levels/1/lang/en-US?noautoplay=true',
    );
    await rotateLandscape(page);

    await expect(lab.submitButton).toBeVisible();
    await expect(lab.submitButton.first()).toBeDisabled();
    await expect(lab.submitButton.last()).toBeDisabled();

    // Answer index 0 is incorrect.
    await lab.clickAnswer(0);

    await expect(lab.submitButton.first()).not.toBeDisabled();
    await expect(lab.submitButton.last()).not.toBeDisabled();

    // Scenario uses :last to submit (maps to submitButton.last()).
    await lab.submitLast();

    // Incorrect-answer modal is client-side; appears synchronously after click.
    await expect(lab.modal).toBeVisible();
    await expect(lab.modalTitle).toContainText('Incorrect answer');

    await lab.dismissModal();

    // #cross_0 becomes visible after modal is dismissed.
    await expect(lab.crossMark(0)).toBeVisible();
  });
});
