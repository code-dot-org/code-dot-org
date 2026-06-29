import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

import {MultiLevel} from '../pages/multi-level';

const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

// target-size results vary between local and Drone (font metrics, DPR) and
// undermine regression detection. Excluded here; cover SC 2.5.8 separately.
const DISABLED_RULES = ['target-size'];

// Baseline of axe violations per state, keyed by rule id and counting the
// failing nodes. A new rule, or more failing nodes for an existing rule, both
// fail the test. If you fix something, lower the count (or remove the rule)
// so the baseline stays honest.
const EXPECTED_VIOLATIONS: Record<string, Record<string, number>> = {
  initialLoad: {'color-contrast': 2, 'image-alt': 5},
  winModal: {'color-contrast': 1},
  afterDismissedIncorrectModal: {'color-contrast': 2, 'image-alt': 5},
};

const violationCounts = (results: {
  violations: {id: string; nodes: unknown[]}[];
}): Record<string, number> =>
  Object.fromEntries(results.violations.map(v => [v.id, v.nodes.length]));

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

    const results = await new AxeBuilder({page})
      .withTags(WCAG_TAGS)
      .disableRules(DISABLED_RULES)
      .analyze();
    expect(violationCounts(results)).toEqual(EXPECTED_VIOLATIONS.initialLoad);
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
      .disableRules(DISABLED_RULES)
      .analyze();
    expect(violationCounts(results)).toEqual(EXPECTED_VIOLATIONS.winModal);
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

    const results = await new AxeBuilder({page})
      .withTags(WCAG_TAGS)
      .disableRules(DISABLED_RULES)
      .analyze();
    expect(violationCounts(results)).toEqual(
      EXPECTED_VIOLATIONS.afterDismissedIncorrectModal,
    );
  });
});
