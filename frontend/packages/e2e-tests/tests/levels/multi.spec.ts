import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

import {MultiLevel} from '../pages/multi-level';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// Baseline of axe rule IDs we currently fail at each state. New violations make
// the test fail; if you fix one, drop it from this list so the test stays honest.
const EXPECTED_VIOLATIONS = {
  initialLoad: ['color-contrast', 'image-alt'],
  winModal: ['color-contrast'],
  afterDismissedIncorrectModal: ['color-contrast', 'image-alt'],
};

const violationIds = (results: {violations: {id: string}[]}): string[] =>
  results.violations.map(v => v.id).sort();

test.describe('Playing multi levels', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature "Loading the level"
   */
  test('Loading the level', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 1});

    await expect(level.submitButton).toBeVisible();
    await expect(level.question).toHaveText(
      'Which arrow gets the Flurb to the treasure?',
    );

    const results = await new AxeBuilder({page}).withTags(WCAG_TAGS).analyze();
    expect(violationIds(results)).toEqual(EXPECTED_VIOLATIONS.initialLoad);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature "Clicking an option enables submit and submitting the correct answer wins"
   */
  test('Clicking an option enables submit and submitting the correct answer wins', async ({
    page,
  }) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 1});

    await expect(level.submitButton).toBeVisible();
    await expect(level.submitButton).toBeDisabled();

    // Index 1 is the correct answer.
    await level.clickAnswer(1);
    await expect(level.submitButton).not.toBeDisabled();

    await level.submit();

    // Win modal is server-gated: appears after the milestone POST.
    await expect(level.modal).toBeVisible();

    // Scope the scan to the modal only — the rest of the page didn't change,
    // and a page-level scan flakes on background re-renders triggered by the
    // milestone POST.
    const results = await new AxeBuilder({page})
      .include('.modal')
      .withTags(WCAG_TAGS)
      .analyze();
    expect(violationIds(results)).toEqual(EXPECTED_VIOLATIONS.winModal);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature "Submitting an incorrect option"
   */
  test('Submitting an incorrect option', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 1, lang: 'en-US'});

    await expect(level.submitButton).toBeVisible();
    await expect(level.submitButton).toBeDisabled();

    // Index 0 is incorrect.
    await level.clickAnswer(0);
    await expect(level.submitButton).not.toBeDisabled();

    await level.submit();

    // Incorrect-answer modal is client-side; appears synchronously after submit.
    await expect(level.modal).toBeVisible();
    await expect(level.modalTitle).toContainText('Incorrect answer');

    await level.dismissModal();
    await expect(level.crossMark(0)).toBeVisible();

    const results = await new AxeBuilder({page}).withTags(WCAG_TAGS).analyze();
    expect(violationIds(results)).toEqual(
      EXPECTED_VIOLATIONS.afterDismissedIncorrectModal,
    );
  });
});
