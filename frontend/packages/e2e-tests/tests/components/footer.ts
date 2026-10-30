import {expect, type Locator, type Page} from '@playwright/test';

/**
 * The site-wide page footer (footer.footer): present on every page. Holds the
 * language selector (form#localeForm > select#locale). A global component
 * composed onto BasePage as `page.footer`, not a page.
 */
export class FooterComponent {
  /** Global language dropdown. */
  readonly localeDropdown: Locator;

  /** The dropdown's selected option; assert its text for the active locale. */
  readonly selectedLocale: Locator;

  constructor(page: Page) {
    this.localeDropdown = page.getByRole('combobox', {name: 'Select language'});
    this.selectedLocale = this.localeDropdown.locator('option:checked');
  }

  /** Wait for the language selector to render. */
  async waitForLocaleDropdownVisible(): Promise<void> {
    await expect(this.localeDropdown).toBeVisible();
  }
}
