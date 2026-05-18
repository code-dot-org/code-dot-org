import {expect, errors, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * Page Object for Match level types — lesson 11 of allthethingscourse unit 1.
 *
 * Match levels render a drag-and-drop puzzle: the student drags answer tiles
 * from an unplaced pool into labelled empty slots.  An instructions modal
 * appears on the first visit and must be dismissed before interacting.
 */
export class Match {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Question text area — `.match .content2`. */
  readonly questionText: Locator;

  /** Top submit button. */
  readonly submitButton: Locator;

  /** Bottom submit button — Cucumber targets it as `.submitButton:last`. */
  readonly reviewButton: Locator;

  /** Modal overlay shown after submission. */
  readonly modal: Locator;

  /** Dialog title inside the modal (e.g. "Correct", "Incorrect"). */
  readonly modalTitle: Locator;

  /** OK button inside the modal. */
  readonly okButton: Locator;

  /** Wrong-answer indicator shown after an incorrect submission. */
  readonly xmark: Locator;

  constructor(page: Page) {
    this.page = page;
    this.questionText = page.locator('.match .content2');
    this.submitButton = page.locator('.submitButton').first();
    this.reviewButton = page.locator('.submitButton').last();
    this.modal = page.locator('.modal');
    this.modalTitle = page.locator('.modal .dialog-title');
    this.okButton = page.locator('#ok-button');
    this.xmark = page.locator('.xmark');
  }

  /**
   * Navigate to a match level and wait for the submit button.
   * Dismisses the instructions modal (`.dash_modal`) if present.
   *
   * @param level - level number within lesson 11
   * @param resetSession - clear any existing session first; pass false when
   *   the caller has already signed in as a specific user and must stay signed in
   */
  async gotoLevel(
    level: number,
    {resetSession = true}: {resetSession?: boolean} = {},
  ): Promise<void> {
    if (resetSession) await this.page.goto('/reset_session');
    await this.page.goto(labLevelUrl(11, level));
    await this.dismissInstructionsIfPresent();
    await expect(this.submitButton).toBeVisible();
  }

  /**
   * Clicks the `.x-close` button if the instructions modal is visible, then
   * waits for the modal to disappear.
   * Mirrors `I dismiss the match instructions dialog` from steps.rb.
   */
  async dismissInstructionsIfPresent(): Promise<void> {
    const xClose = this.page.locator('.x-close');
    await xClose
      .waitFor({state: 'visible', timeout: 5000})
      .catch((e: unknown) => {
        if (!(e instanceof errors.TimeoutError)) throw e;
      });
    if (await xClose.isVisible()) {
      await xClose.click();
    }
    await this.page
      .locator('.dash_modal')
      .waitFor({state: 'hidden', timeout: 5000})
      .catch((e: unknown) => {
        if (!(e instanceof errors.TimeoutError)) throw e;
      });
  }

  /**
   * Dismisses the sign-in callout overlay if present.
   * Mirrors `I dismiss the login reminder` from steps.rb.
   */
  async dismissLoginReminderIfPresent(): Promise<void> {
    const closeBtn = this.page.locator("[aria-label='Close']");
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
    }
    await this.page
      .locator('.uitest-signincallout')
      .waitFor({state: 'hidden', timeout: 5000})
      .catch((e: unknown) => {
        if (!(e instanceof errors.TimeoutError)) throw e;
      });
  }

  /**
   * Returns an answer tile by its original index attribute.
   *
   * @param originalIndex - value of the `originalindex` attribute on the tile
   */
  answer(originalIndex: number): Locator {
    return this.page.locator(`.answer[originalindex="${originalIndex}"]`);
  }

  /**
   * Returns the nth empty slot (0-based) in the drop target area.
   *
   * @param slotIndex - 0-based slot index
   */
  emptySlot(slotIndex: number): Locator {
    return this.page.locator('.emptyslot').nth(slotIndex);
  }

  /**
   * Drags an answer tile into the first available empty slot.
   * Mirrors `I drag ".answer[originalindex=N]" to ".emptyslot:first"`.
   *
   * @param originalIndex - `originalindex` attribute of the answer tile
   */
  async dragAnswerToFirstSlot(originalIndex: number): Promise<void> {
    const answer = this.answer(originalIndex);
    const slots = this.page.locator('.emptyslot');
    await answer.scrollIntoViewIfNeeded();
    await slots.first().scrollIntoViewIfNeeded();

    for (let attempt = 1; attempt <= 3; attempt++) {
      const remainingSlots = await slots.count();
      await answer.dragTo(slots.first(), {force: true});

      try {
        await expect(slots).toHaveCount(remainingSlots - 1, {timeout: 3000});
        return;
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
  }

  /** Clicks the submit button and waits for the result modal to appear. */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await expect(this.modal).toBeVisible();
  }
}
