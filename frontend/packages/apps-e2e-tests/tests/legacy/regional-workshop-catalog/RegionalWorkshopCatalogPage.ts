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
    await this.expectDefaultSearchView();
  }

  /**
   * Opens the workshop catalog with a zip query.
   *
   * @param zip - zip code to request
   */
  async gotoWithZip(zip: string): Promise<void> {
    await this.page.goto(`/professional-learning/workshops?zip=${zip}`);
  }

  /**
   * Asserts the search form has loaded. This visible state replaces the
   * Cucumber page-load wait.
   */
  async expectDefaultSearchView(): Promise<void> {
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

  /**
   * Asserts a regional partner result and local workshops section are visible.
   *
   * @param partnerName - regional partner name
   */
  async expectRegionalPartnerWorkshops(partnerName: string): Promise<void> {
    await expect(this.page.getByText(partnerName).first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      this.page.getByRole('heading', {name: 'Upcoming local workshops'}),
    ).toBeVisible();
  }

  /**
   * Opens and closes the partner info modal.
   */
  async openAndClosePartnerInfo(): Promise<void> {
    await this.page.getByRole('button', {name: 'partnerInfo'}).click();
    const returnButton = this.page.getByRole('button', {
      name: 'Return to workshops',
    });
    await expect(returnButton).toBeVisible();
    await returnButton.click();
  }

  /**
   * Asserts the partner contact link includes the selected zip.
   *
   * @param zip - zip code expected in the contact URL
   */
  async expectPartnerContactHref(zip: string): Promise<void> {
    await expect(this.page.locator('#rpContactLink')).toHaveAttribute(
      'href',
      new RegExp(
        `/professional-learning/contact-regional-partner\\?zip=${zip}`,
      ),
    );
  }
}
