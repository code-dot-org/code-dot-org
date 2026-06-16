import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {BasePage} from './base-page';

/** Page object for the multi-choice (multi) level type. */
export class MultiLevel extends BasePage {
  /** The multiple-choice question text. */
  readonly question: Locator;

  /** The submit button. The source feature's :first/:last both resolve here — there is exactly one. */
  readonly submitButton: Locator;

  /** The modal dialog that appears on submit. */
  readonly modal: Locator;

  /** The dialog title within the modal. */
  readonly modalTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.question = page.locator('.multi-question');
    this.submitButton = page.locator('.submitButton');
    this.modal = page.locator('.modal');
    this.modalTitle = page.locator('.modal .dialog-title');
  }

  /** Navigate to a multi level and wait for the widget to render. */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /** The multi widget is ready once its submit button is visible. */
  async waitForReady(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
  }

  /** Click an answer button by its index attribute. */
  async clickAnswer(index: number): Promise<void> {
    await this.page.locator(`.answerbutton[index="${index}"]`).click();
  }

  /** Submit the selected answer. */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Dismiss the modal by clicking its OK button. */
  async dismissModal(): Promise<void> {
    await this.page.locator('.modal #ok-button').click();
  }

  /** Locator for the cross-mark element at a given answer index (shown after incorrect submit). */
  crossMark(index: number): Locator {
    return this.page.locator(`#cross_${index}`);
  }
}
