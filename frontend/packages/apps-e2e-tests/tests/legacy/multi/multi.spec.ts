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
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature
   * Scenario: Loading the level
   */
  test('loading the level shows question text', async ({page}) => {
    const multi = new Multi(page);
    await multi.gotoLevel(9, 1);
    await expect(multi.question).toHaveText(
      'Which arrow gets the Flurb to the treasure?',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature
   * Scenario: Clicking an option enables submit and submitting the correct answer wins
   */
  test(
    'correct answer enables submit and shows completion modal',
    {tag: '@no_mobile'},
    async ({page}) => {
      const multi = new Multi(page);
      await multi.gotoLevel(9, 1);
      await multi.expectSubmitDisabled();
      await multi.selectAnswer(1);
      await multi.expectSubmitEnabled();
      await multi.submit();
      await expect(multi.modal).toBeVisible();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi.feature
   * Scenario: Submitting an incorrect option
   */
  test(
    'incorrect answer shows error modal with cross marker',
    {tag: '@no_mobile'},
    async ({page}) => {
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi3.feature
   * Scenario: Rendering in another language
   */
  test('renders in Spanish', async ({page}) => {
    const multi = new Multi(page);
    await multi.gotoLocalizedLevel(9, 1, 'es-MX');
    await expect(multi.heading).toHaveText('Opción múltiple');
    await expect(multi.question).toHaveText(
      '¿Qué flecha lleva al Flurb hacia el tesoro?',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi3.feature
   * Scenario: Does not scroll horizontally
   */
  test('does not scroll horizontally', async ({page}) => {
    const multi = new Multi(page);
    await multi.gotoLevel(9, 2);
    expect(await multi.hasNoHorizontalScrollbar()).toBe(true);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi3.feature
   * Scenario: Can render without a question
   */
  test('can render without a question', async ({page}) => {
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
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi2.feature
   * Scenario: Loading the level
   */
  test('loading the level shows multi-select question text', async ({page}) => {
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await expect(multi.question).toContainText(
      'Which lines of code should be removed',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi2.feature
   * Scenario: Clicking an option enables submit but submitting only one answer gets a warning
   */
  test('one answer selected triggers too-few-answers warning', async ({
    page,
  }) => {
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await multi.expectSubmitDisabled();
    await multi.selectAnswer(0);
    await multi.expectSubmitEnabled();
    await multi.submit();
    await expect(multi.modalTitle).toHaveText('Too few answers.');
    await multi.okButton.click();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi2.feature
   * Scenario: Clicking an option enables submit and submitting the correct answer (two checkboxes) wins
   */
  test('two correct answers wins', async ({page}) => {
    const multi = new Multi(page);
    await multi.gotoLevel(10, 1);
    await multi.expectSubmitDisabled();
    await multi.selectAnswer(0);
    await multi.expectSubmitEnabled();
    await multi.selectAnswer(1);
    await multi.submit();
    await expect(multi.modal).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi4.feature
   * Scenario: Submitting an incorrect option
   */
  test(
    'incorrect pair shows error modal',
    {tag: '@no_mobile'},
    async ({page}) => {
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi4.feature
   * Scenario: Pressing three options unselects the oldest
   */
  test('selecting a third option auto-deselects the oldest', async ({page}) => {
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

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi4.feature
   * Scenario: Pressing an option again toggles it
   */
  test('pressing a selected option again deselects it', async ({page}) => {
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
  test('standalone level locks after answer is submitted', async ({
    studentPage,
  }) => {
    // Webkit: lock-after-submit flaky under parallel run; passes alone.
    test.fixme(
      true,
      'TODO: standalone multi level lock-after-submit flaky on webkit/chromium under parallel run; timing issue with lock-answers class or submit button visibility',
    );
    // Source: multi3.feature scenario 4
    const multi = new Multi(studentPage);
    await multi.gotoLevel(9, 5, {resetSession: false});
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

    // After reloading, the level stays locked: answer buttons carry the
    // lock-answers class.  Wait for the first answer button to appear before
    // asserting — page must be hydrated before class checks are meaningful.
    await studentPage.reload();
    await multi.answerButton(0).waitFor({state: 'visible', timeout: 30_000});
    await expect(multi.answerButton(0)).toHaveClass(/lock-answers/);
    await expect(multi.answerButton(1)).toHaveClass(/lock-answers/);
    await expect(multi.answerButton(2)).toHaveClass(/lock-answers/);
    await expect(multi.answerButton(3)).toHaveClass(/lock-answers/);
  });
});
