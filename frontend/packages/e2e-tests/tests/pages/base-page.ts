import {expect, type Locator, type Page} from '@playwright/test';

/** Base for every page object — home for the UI common to all pages. */
export class BasePage {
  protected readonly page: Page;

  /** Global language dropdown. */
  protected readonly localeDropdown: Locator;

  /** The dropdown's selected option; assert its text for the active locale. */
  readonly selectedLocale: Locator;

  constructor(page: Page) {
    this.page = page;
    this.localeDropdown = page.getByRole('combobox', {name: 'Select language'});
    this.selectedLocale = this.localeDropdown.locator('option:checked');
  }

  /** Wait for the locale dropdown to render. */
  async waitForLocaleDropdownVisible(): Promise<void> {
    await expect(this.localeDropdown).toBeVisible();
  }
}
