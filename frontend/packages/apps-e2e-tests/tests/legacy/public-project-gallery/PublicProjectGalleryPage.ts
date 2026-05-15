import {expect, type Page} from '@playwright/test';

/**
 * Page object for the signed-out public project gallery.
 */
export class PublicProjectGalleryPage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the public project gallery.
   */
  async goto(): Promise<void> {
    await this.page.goto('/projects/public');
  }

  /**
   * Verifies the gallery shell is visible.
   */
  async expectExpectedElements(): Promise<void> {
    await expect(this.page.locator('h1')).toContainText('Projects', {
      timeout: 30_000,
    });
    await expect(this.page.locator('#uitest-public-projects')).toBeVisible();
  }

  /**
   * Verifies project type and featured project sections render.
   */
  async expectProjectTypes(): Promise<void> {
    await this.page
      .locator('#uitest-public-projects')
      .waitFor({state: 'visible', timeout: 30_000});
    await this.page
      .locator('.ui-project-app-type-area')
      .first()
      .waitFor({state: 'attached'});
    await expect(this.page.locator('.ui-project-app-type-area')).toHaveCount(1);
    await expect(this.page.locator('.ui-featured')).toContainText(
      'Featured Projects',
    );
  }

  /**
   * Opens the public gallery with the special-topic experiment enabled.
   */
  async gotoSpecialTopicExperiment(): Promise<void> {
    await this.page.goto('/projects/public/?enableExperiments=special-topic');
    await expect(this.page.locator('#projects-page')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      this.page.locator('.ui-project-app-type-area').first(),
    ).toBeAttached({
      timeout: 30_000,
    });
  }

  /**
   * Verifies the special-topic experiment project sections.
   */
  async expectSpecialTopics(): Promise<void> {
    await expect(this.page.locator('.ui-project-app-type-area')).toHaveCount(
      2,
      {
        timeout: 30_000,
      },
    );
    await expect(this.page.locator('.ui-special_topic')).toContainText(
      'View more Featured Topics projects',
      {timeout: 30_000},
    );
  }
}
