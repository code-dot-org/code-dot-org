import {expect, test} from '../../shared/fixtures';
import {expectPerfect, headerBubble} from '../../shared/progress';

import {Multi} from './Multi';

/**
 * Multi-choice level type — single-answer (lesson 9) and multi-select (lesson
 * 10) variants.
 *
 * Sources:
 *   dashboard/test/ui/features/teacher_tools/level_types/multi.feature
 *   dashboard/test/ui/features/teacher_tools/level_types/multi2.feature
 *   dashboard/test/ui/features/teacher_tools/level_types/multi3.feature
 *   dashboard/test/ui/features/teacher_tools/level_types/multi4.feature
 *
 * Anonymous (no auth required).  `@no_mobile` tags from the source features
 * are propagated where applicable.
 */

// ─── Lesson 9 — single-answer ───────────────────────────────────────────────

/**
 * Source: multi.feature and multi3.feature.
 * Level lives at allthethingscourse/units/1/lessons/9/levels/N.
 */
test.describe('Multi — single-answer (lesson 9)', () => {
  test('loading the level shows question text', async ({page}) => {
    // Source: multi.feature "Loading the level"
    const multi = new Multi(page);
    await multi.gotoLevel(9, 1);
    await expect(multi.question).toHaveText(
      'Which arrow gets the Flurb to the treasure?',
    );
  });

  test(
    'correct answer enables submit and shows completion modal',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Source: multi.feature "Clicking an option enables submit and submitting the correct answer wins"
      const multi = new Multi(page);
      await multi.gotoLevel(9, 1);
      await multi.expectSubmitDisabled();
      await multi.selectAnswer(1);
      await multi.expectSubmitEnabled();
      await multi.submit();
      await expect(multi.modal).toBeVisible();
    },
  );

  test(
    'incorrect answer shows error modal with cross marker',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Source: multi.feature "Submitting an incorrect option"
      // Cucumber targets ".submitButton:last" (review/bottom button) — use reviewButton.
      const multi = new Multi(page);
      await multi.gotoLevel(9, 1);
      await multi.expectSubmitDisabled();
      await multi.selectAnswer(0);
      await multi.expectSubmitEnabled();
      await multi.reviewButton.click();
      await expect(multi.modal).toBeVisible();
      await expect(multi.modalTitle).toHaveText('Incorrect answer');
      await multi.okButton.click();
      await expect(multi.crossMark(0)).toBeVisible();
    },
  );

  test('does not scroll horizontally', async ({page}) => {
    // Source: multi3.feature "Does not scroll horizontally" — levels/2
    const multi = new Multi(page);
    await multi.gotoLevel(9, 2);
    expect(await multi.hasNoHorizontalScrollbar()).toBe(true);
  });

  test('can render without a question', async ({page}) => {
    // Source: multi3.feature "Can render without a question" — levels/4
    const multi = new Multi(page);
    await multi.gotoLevel(9, 4);
    await expect(multi.question).toBeHidden();
  });
});

// ─── Lesson 10 — multi-select (two correct answers required) ─────────────────

/**
 * Source: multi2.feature and multi4.feature.
 * Level lives at allthethingscourse/units/1/lessons/10/levels/1.
 * Background in both features navigates to this level before each scenario.
 */
test.describe('Multi — multi-select (lesson 10)', () => {
  test('loading the level shows multi-select question text', async ({page}) => {
    // Source: multi2.feature "Loading the level"
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await expect(multi.question).toContainText(
      'Which lines of code should be removed',
    );
  });

  test('one answer selected triggers too-few-answers warning', async ({
    page,
  }) => {
    // Source: multi2.feature "Clicking an option enables submit but submitting only one answer gets a warning"
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await multi.expectSubmitDisabled();
    await multi.selectAnswer(0);
    await multi.expectSubmitEnabled();
    await multi.submit();
    await expect(multi.modalTitle).toHaveText('Too few answers.');
    await multi.okButton.click();
  });

  test('two correct answers wins', async ({page}) => {
    // Source: multi2.feature "Clicking an option enables submit and submitting the correct answer (two checkboxes) wins"
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await multi.expectSubmitDisabled();
    await multi.selectAnswer(0);
    await multi.expectSubmitEnabled();
    await multi.selectAnswer(1);
    await multi.submit();
    await expect(multi.modal).toBeVisible();
  });

  test(
    'incorrect pair shows error modal',
    {tag: '@no_mobile'},
    async ({page}) => {
      // Source: multi4.feature "Submitting an incorrect option"
      // Cucumber targets ".submitButton:last" — use reviewButton.
      const multi = new Multi(page);
      await multi.gotoLevel(10, 1);
      await multi.expectSubmitDisabled();
      await multi.selectAnswer(2);
      await multi.expectSubmitEnabled();
      await multi.selectAnswer(3);
      await multi.reviewButton.click();
      await expect(multi.modal).toBeVisible();
      await expect(multi.modalTitle).toHaveText('Incorrect answer');
      await multi.okButton.click();
    },
  );

  test('selecting a third option auto-deselects the oldest', async ({page}) => {
    // Source: multi4.feature "Pressing three options unselects the oldest"
    // Selecting 2, 1, 0 should keep 1 and 0 selected (drops 2, the oldest).
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await multi.expectSubmitDisabled();
    await multi.selectAnswer(2);
    await multi.expectSubmitEnabled();
    await multi.selectAnswer(1);
    await multi.selectAnswer(0);
    await multi.submit();
    await expect(multi.modal).toBeVisible();
  });

  test('pressing a selected option again deselects it', async ({page}) => {
    // Source: multi4.feature "Pressing an option again toggles it"
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await multi.expectSubmitDisabled();
    await multi.selectAnswer(0);
    await multi.expectSubmitEnabled();
    await expect(multi.checkMark(0)).toBeVisible();
    await multi.selectAnswer(0);
    await expect(multi.checkMark(0)).toBeHidden();
  });
});

// ─── Lesson 9 level 5 — locks after a single submission ──────────────────────

/**
 * Source: multi3.feature "Standalone level without retries locks after answer is submitted".
 * This level is configured with no-retry: once an answer is submitted the
 * answer buttons get class "lock-answers" and the submit button is hidden.
 */
test.describe('Multi — non-retryable level (lesson 9 level 5)', () => {
  test(
    'standalone level locks after answer is submitted',
    async ({studentPage}) => {
      // Source: multi3.feature scenario 4
      const multi = new Multi(studentPage);
      await multi.gotoLevel(9, 5);
      await multi.expectSubmitDisabled();
      await multi.selectAnswer(0);
      await multi.submit();

      // Submitting wrong answer shows error modal; progress is still perfect
      // because the level accepts one attempt.
      await expect(multi.modalTitle).toContainText('Incorrect answer');
      await expectPerfect(headerBubble(studentPage, 5));
      await multi.okButton.click();

      // Post-submission state: next-level button visible, cross mark shown,
      // answer buttons are locked.
      await expect(multi.nextLevelButton).toBeVisible();
      await expect(multi.crossMark(0)).toBeVisible();
      await expect(multi.answerButton(0)).toHaveClass(/lock-answers/);

      // After reloading, the level stays locked: submit is disabled and answer
      // buttons carry the lock-answers class.  The server marks this level with
      // one attempt allowed so the submit button remains visible but disabled.
      await studentPage.reload();
      await expect(multi.submitButton).toBeDisabled({timeout: 30_000});
      await expect(multi.nextLevelButton).toBeVisible({timeout: 15_000});
      await expect(multi.answerButton(0)).toHaveClass(/lock-answers/);
      await expect(multi.answerButton(1)).toHaveClass(/lock-answers/);
      await expect(multi.answerButton(2)).toHaveClass(/lock-answers/);
      await expect(multi.answerButton(3)).toHaveClass(/lock-answers/);
    },
  );
});
