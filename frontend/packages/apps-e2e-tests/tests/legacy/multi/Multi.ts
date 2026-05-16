import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * Page Object for Multi-choice level types — lessons 9 and 10 of
 * allthethingscourse unit 1.
 *
 * These are standalone question levels, not Blockly labs.  The level renders a
 * question with clickable answer buttons and two submit buttons (top and bottom,
 * both disabled until an answer is selected).
 */
export class Multi {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Question text container — `.multi-question`. */
  readonly question: Locator;

  /** Level heading — `.multi h1`. */
  readonly heading: Locator;

  /** Top submit button — disabled until an answer is selected. */
  readonly submitButton: Locator;

  /** Bottom submit button — mirrors the top; Cucumber targets it as `:last`. */
  readonly reviewButton: Locator;

  /** Modal overlay shown after submission. */
  readonly modal: Locator;

  /** Dialog title inside the modal (e.g. "Incorrect answer", "Too few answers."). */
  readonly modalTitle: Locator;

  /** OK button inside the post-submission modal. */
  readonly okButton: Locator;

  /** Next-level button shown after a correct submission. */
  readonly nextLevelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.question = page.locator('.multi-question');
    this.heading = page.locator('.multi h1');
    this.submitButton = page.locator('.submitButton').first();
    this.reviewButton = page.locator('.submitButton').last();
    this.modal = page.locator('.modal');
    this.modalTitle = page.locator('.modal .dialog-title');
    this.okButton = page.locator('#ok-button');
    this.nextLevelButton = page.locator('.nextLevelButton');
  }

  /**
   * Navigate to a multi level and wait for the submit button to appear.
   *
   * @param lesson - lesson number within allthethingscourse unit 1
   * @param level - level number within that lesson
   * @param resetSession - clear any existing session first; pass false when
   *   the caller has already signed in as a specific user and must stay signed in
   */
  async gotoLevel(
    lesson: number,
    level: number,
    {resetSession = true}: {resetSession?: boolean} = {},
  ): Promise<void> {
    if (resetSession) {
      await this.page.goto('/reset_session', {waitUntil: 'domcontentloaded'});
    }
    await this.page.goto(labLevelUrl(lesson, level), {
      waitUntil: 'domcontentloaded',
    });
    await expect(this.submitButton).toBeVisible({timeout: 30_000});
  }

  /**
   * Navigate to a localized multi level and wait for the submit button to appear.
   *
   * @param lesson - lesson number within allthethingscourse unit 1
   * @param level - level number within that lesson
   * @param locale - dashboard locale code, for example es-MX
   * @param resetSession - clear any existing session first; pass false when
   *   the caller has already signed in as a specific user and must stay signed in
   */
  async gotoLocalizedLevel(
    lesson: number,
    level: number,
    locale: string,
    {resetSession = true}: {resetSession?: boolean} = {},
  ): Promise<void> {
    if (resetSession) {
      await this.page.goto('/reset_session', {waitUntil: 'domcontentloaded'});
    }
    await this.page.goto(
      `/courses/allthethingscourse/units/1/lessons/${lesson}/levels/${level}/lang/${locale}`,
      {waitUntil: 'domcontentloaded'},
    );
    await expect(this.submitButton).toBeVisible({timeout: 30_000});
  }

  /**
   * Returns the answer button at the given 0-based index.
   *
   * @param index - 0-based answer option index
   */
  answerButton(index: number): Locator {
    return this.page.locator(`.answerbutton[index="${index}"]`);
  }

  /**
   * Returns the wrong-answer cross marker for the given answer index.
   * Visible only after submitting with that answer selected.
   *
   * @param index - 0-based answer index
   */
  crossMark(index: number): Locator {
    return this.page.locator(`#cross_${index}`);
  }

  /**
   * Returns the selected-answer check marker for the given answer index.
   * Tracks which answers are currently selected.
   *
   * @param index - 0-based answer index
   */
  checkMark(index: number): Locator {
    return this.page.locator(`#checked_${index}`);
  }

  /** Clicks the answer button at the given index. */
  async selectAnswer(index: number): Promise<void> {
    await this.answerButton(index).click();
  }

  /** Asserts both submit buttons are disabled. */
  async expectSubmitDisabled(): Promise<void> {
    await expect(this.submitButton).toBeDisabled();
    await expect(this.reviewButton).toBeDisabled();
  }

  /** Asserts both submit buttons are enabled. */
  async expectSubmitEnabled(): Promise<void> {
    await expect(this.submitButton).toBeEnabled();
    await expect(this.reviewButton).toBeEnabled();
  }

  /**
   * Clicks the top submit button and waits for the modal to appear.
   * Use `reviewButton.click()` directly when the Cucumber source presses `:last`.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await expect(this.modal).toBeVisible();
  }

  /**
   * Returns true if the page has no horizontal scrollbar.
   * Mirrors `there is no horizontal scrollbar` from steps.rb.
   */
  async hasNoHorizontalScrollbar(): Promise<boolean> {
    return this.page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth,
    );
  }
}
