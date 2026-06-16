import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {BasePage} from './base-page';

/** Page object for the multi-choice (multi) level type. */
export class MultiLab extends BasePage {
  /** The multiple-choice question text. */
  readonly question: Locator;

  /** The submit button (there is exactly one; :first and :last in Cucumber both resolve here). */
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

  /** Navigate to a multi level and wait for the submit button to be visible. */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /** Navigate to a literal URL (for paths with /lang/ segments or extra params). */
  async gotoUrl(url: string): Promise<void> {
    await this.page.goto(url, {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /** Wait for the multi widget to be rendered and interactive. */
  async waitForReady(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
  }

  /** Click an answer button by its index attribute. */
  async clickAnswer(index: number): Promise<void> {
    await this.page.locator(`.answerbutton[index="${index}"]`).click();
  }

  /** Click the first (or only) submit button — Cucumber `:first` mapping. */
  async submit(): Promise<void> {
    await this.submitButton.first().click();
  }

  /** Click the last submit button — Cucumber `:last` mapping (scenario 3). */
  async submitLast(): Promise<void> {
    await this.submitButton.last().click();
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
