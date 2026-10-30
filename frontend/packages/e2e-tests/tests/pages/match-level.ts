import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/** match.js and textMatch.js render the same widget, so one POM serves both. */
export class MatchLevel extends LessonLevelPage {
  /** Widget root; a11y scans scope here rather than the shared chrome. */
  readonly rootSelector = '.match';

  /** The widget repeats this above and below the lists, hence `.first()`. */
  readonly submitButton: Locator;

  /** Item order is shuffled on every load, so visual checks must mask this. */
  readonly answers: Locator;

  constructor(page: Page) {
    super(page);
    this.submitButton = page
      .locator(this.rootSelector)
      .getByRole('button', {name: 'Submit'})
      .first();
    this.answers = page.locator('.match_answers');
  }

  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  async waitForReady(): Promise<void> {
    await expect(this.submitButton).toBeVisible();
  }
}
