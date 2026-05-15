import {expect, type Page} from '@playwright/test';

const LEVEL_URL = '/courses/allthethingscourse/units/1/lessons/38/levels/1';

/**
 * Page object for the allthethingscourse mini-rubric feedback tab.
 */
export class FeedbackTabPage {
  private readonly page: Page;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Completes the level so the feedback tab is available.
   */
  async completeLevel(): Promise<void> {
    await this.page.goto(`${LEVEL_URL}?noautoplay=true`);
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('#runButton').click();
    await expect(this.page.locator('#finishButton')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('#finishButton').click();
  }

  /**
   * Opens the rubric feedback tab and verifies the key concept text.
   */
  async expectStudentKeyConceptFeedbackTab(): Promise<void> {
    await this.page.goto(LEVEL_URL);
    await expect(this.page.locator('.uitest-feedback')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.locator('.uitest-feedback').first().click();
    await expect(this.page.locator('.editor-column').first()).toContainText(
      'This is the key concept for this mini rubric.',
      {timeout: 30_000},
    );
    await expect(
      this.page.locator('#ui-test-submit-feedback'),
    ).not.toBeVisible();
  }
}
