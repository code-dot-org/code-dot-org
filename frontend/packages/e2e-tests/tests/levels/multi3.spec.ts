import {expect, test} from '../fixtures';
import {MultiLevel} from '../pages/multi-level';
import {expectElementHasI18nText} from '../shared/i18n';

test.describe('Playing multi levels 3', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi3.feature "Rendering in another language"
   */
  test('Rendering in another language', async ({page}) => {
    const level = new MultiLevel(page);

    // original URL omits noautoplay
    await level.gotoLevel({
      lesson: 9,
      level: 1,
      lang: 'es-MX',
      noautoplay: false,
    });

    await expect(level.submitButton).toBeVisible();
    await expectElementHasI18nText({
      locator: level.heading,
      locale: 'es-MX',
      key: 'data.dsls.K-1 Happy Maps Multi 1.title',
    });
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi3.feature "Does not scroll horizontally"
   */
  test('Does not scroll horizontally', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 2});

    await expect(level.submitButton).toBeVisible();
    expect(await level.hasHorizontalScrollbar()).toBe(false);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi3.feature "Can render without a question"
   */
  test('Can render without a question', async ({page}) => {
    const level = new MultiLevel(page);

    await level.gotoLevel({lesson: 9, level: 4});

    await expect(level.submitButton).toBeVisible();
    await expect(level.question).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/teacher_tools/level_types/multi3.feature "Standalone level without retries locks after answer is submitted"
   */
  test('Standalone level without retries locks after answer is submitted', async ({
    page,
    signInAsNewUser,
  }) => {
    // --- sign in as a student and open level 5 in landscape ---
    await signInAsNewUser({type: 'student', name: 'Sally Student'});

    const level = new MultiLevel(page);
    await level.gotoLevel({lesson: 9, level: 5, lang: 'en-US'});
    await level.rotateToLandscape();

    await expect(level.submitButton).toBeVisible();
    await expect(level.submitButton).toBeDisabled();

    // --- submit an incorrect answer, waiting for it to persist ---
    // The reload below reads server-rendered HTML, and no UI signal reliably
    // proves persistence (the bubble can turn green from client state), so gate
    // on the /milestone/ POST. Promise.all registers the listener before the
    // click and avoids a floating response promise.
    await level.clickAnswer(0); // incorrect
    await Promise.all([
      page.waitForResponse(resp => resp.url().includes('/milestone/')),
      level.submit(),
    ]);

    // --- it is marked complete and the answers lock in-session ---
    await expect(level.modalTitle).toContainText('Incorrect answer');
    // 'perfect' = submitted: a no-retry level completes on any answer.
    await expect(level.headerProgressBubble(5)).toBeVisible();
    await expect.poll(() => level.isProgressBubblePerfect(5)).toBe(true);

    await level.dismissModal();

    await expect(level.nextLevelButton).toBeVisible();
    await expect(level.crossMark(0)).toBeVisible();
    await expect(level.answerButton(0)).toHaveClass(/lock-answers/);

    // --- the locked state survives a reload (server-rendered) ---
    await page.reload({waitUntil: 'domcontentloaded'});

    await expect(level.nextLevelButton).toBeVisible();
    await expect(level.submitButton).not.toBeVisible();
    await expect(level.answerButton(0)).toHaveClass(/lock-answers/);
    await expect(level.answerButton(1)).toHaveClass(/lock-answers/);
    await expect(level.answerButton(2)).toHaveClass(/lock-answers/);
    await expect(level.answerButton(3)).toHaveClass(/lock-answers/);
  });
});
