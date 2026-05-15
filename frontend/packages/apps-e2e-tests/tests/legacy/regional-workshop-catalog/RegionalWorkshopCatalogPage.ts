import {expect, type Page} from '@playwright/test';

/**
 * Page object for the public regional workshop catalog.
 */
export class RegionalWorkshopCatalogPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the workshop catalog and waits for the default search view.
   */
  async goto(): Promise<void> {
    await this.page.goto('/professional-learning/workshops');
    await expect(
      this.page.getByRole('heading', {
        name: 'Find Code.org workshops near you',
      }),
    ).toBeVisible({timeout: 30_000});
    await expect(
      this.page.getByRole('heading', {name: 'Enter zip code to see workshops'}),
    ).toBeVisible();
  }

  /**
   * Searches by zip code.
   *
   * @param zip - zip code to enter
   */
  async searchZip(zip: string): Promise<void> {
    await this.page.locator("input[name='zipSearch']").fill(zip);
    await this.page.getByRole('button', {name: 'submitZip'}).click();
  }
}
