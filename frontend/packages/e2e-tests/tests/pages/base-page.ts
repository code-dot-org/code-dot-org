import {expect, type Locator, type Page} from '@playwright/test';

/** Base for every page object — home for the UI common to all pages. */
export class BasePage {
  protected readonly page: Page;

  /** Global language dropdown. */
  protected readonly localeDropdown: Locator;

  /** The dropdown's selected option; assert its text for the active locale. */
  readonly selectedLocale: Locator;

  /** Header user-menu element; duplicates per breakpoint, .first() avoids strict-mode failure. */
  protected readonly headerUser: Locator;

  constructor(page: Page) {
    this.page = page;
    this.localeDropdown = page.getByRole('combobox', {name: 'Select language'});
    this.selectedLocale = this.localeDropdown.locator('option:checked');
    this.headerUser = page.locator('.header_user').first();
  }

  /** Wait for the locale dropdown to render. */
  async waitForLocaleDropdownVisible(): Promise<void> {
    await expect(this.localeDropdown).toBeVisible();
  }

  /** Wait until the signed-in header chrome is visible. */
  async waitForSignedIn(): Promise<void> {
    await expect(this.headerUser).toBeVisible();
  }

  /**
   * Switch Global Edition region via the ?ge_region=<code> override, which the
   * Rails Global Edition middleware honors on any path, then confirm the region
   * took effect on the resulting page.
   */
  async switchToGlobalEditionRegion(regionCode: string): Promise<void> {
    const url = new URL(this.page.url());
    url.searchParams.set('ge_region', regionCode);
    await this.page.goto(url.toString());
    await expect(this.globalEditionRegionHtml(regionCode)).toBeVisible();
  }

  /**
   * The root <html> element when the given Global Edition region is active.
   * Rails sets data-ge-region on <html> on every page, so this is page-agnostic
   * and is the authoritative signal that the region applied (stronger than the
   * URL prefix — it also catches the firefox/webkit ge_region cookie race).
   */
  globalEditionRegionHtml(regionCode: string): Locator {
    return this.page.locator(`html[data-ge-region='${regionCode}']`);
  }
}
