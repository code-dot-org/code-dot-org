import {expect, test} from '@playwright/test';

import {MultiLevel} from '../pages/multi-level';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';

// Expected violations per state: rule id -> failing node count (settle() makes
// the counts deterministic). Scoped to the widget; the header's color-contrast
// belongs to the sign-in spec. Inventory:
//   image-alt: 4 answer-option images + the content image (.content > img).
//   color-contrast: the win dialog #ok-button, white on #ffa400 (1.98:1).
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  initialLoad: {'image-alt': 5},
  winModal: {'color-contrast': 1},
  afterDismissedIncorrectModal: {'image-alt': 5},
};

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

    expect(
      await analyze(page, {include: level.rootSelector, tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.initialLoad);
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

    // Scope to the dialog: the milestone POST re-renders the background.
    expect(
      await analyze(page, {include: level.modalSelector, tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.winModal);
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

    expect(
      await analyze(page, {include: level.rootSelector, tags: WCAG_AA_TAGS}),
    ).toEqual(EXPECTED_VIOLATIONS.afterDismissedIncorrectModal);
  });
});
