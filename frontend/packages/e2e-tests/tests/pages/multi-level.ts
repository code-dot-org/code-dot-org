import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/** Page object for the multi-choice (multi) level type. */
export class MultiLevel extends LessonLevelPage {
  /** Multi widget root; a11y scans scope here, not the shared chrome. */
  readonly rootSelector = '.multi';

  /** Dialog shown on submit (win or incorrect). */
  readonly modalSelector = '.modal';

  /** The multiple-choice question text. */
  readonly question: Locator;

  /** The submit button. */
  readonly submitButton: Locator;

  /** The modal dialog that appears on submit. */
  readonly modal: Locator;

  /** The dialog title within the modal. */
  readonly modalTitle: Locator;

  /** The "next level" button shown after the level is completed/locked. */
  readonly nextLevelButton: Locator;

  /** The level title heading rendered by the multi widget. */
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.question = page.locator('.multi-question');
    this.submitButton = page.locator('.submitButton');
    this.modal = page.locator(this.modalSelector);
    this.modalTitle = page.locator(`${this.modalSelector} .dialog-title`);
    this.nextLevelButton = page.locator('.nextLevelButton');
    this.heading = page.locator(`${this.rootSelector} h1`);
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
    await this.answerButton(index).click();
  }

  /** Submit the selected answer. */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /** Dismiss the modal by clicking its OK button. */
  async dismissModal(): Promise<void> {
    await this.modal.locator('#ok-button').click();
  }

  /** Locator for the cross-mark element at a given answer index (shown after incorrect submit). */
  crossMark(index: number): Locator {
    return this.page.locator(`#cross_${index}`);
  }

  /** Locator for the checked-mark element at a given answer index (visible when answer is selected). */
  checkedMark(index: number): Locator {
    return this.page.locator(`#checked_${index}`);
  }

  /** Locator for an answer button by its index attribute. */
  answerButton(index: number): Locator {
    return this.page.locator(`.answerbutton[index="${index}"]`);
  }
}
