import {expect, type Locator, type Page} from '@playwright/test';

import {GdprDialogComponent} from '../components/gdpr-dialog';
import {StudentInfoModalComponent} from '../components/student-info-modal';

/** Base for every page object — home for the UI common to all pages. */
export class BasePage {
  protected readonly page: Page;

  /** Global language dropdown. */
  protected readonly localeDropdown: Locator;

  /** The dropdown's selected option; assert its text for the active locale. */
  readonly selectedLocale: Locator;

  /** Header user-menu element; duplicates per breakpoint, .first() avoids strict-mode failure. */
  protected readonly headerUser: Locator;

  /** #header_user_menu — the signed-in user menu node; .first() guards breakpoint duplicates. */
  readonly headerUserMenu: Locator;

  /** .display_name — the signed-in user's display name chip; .first() guards breakpoint duplicates. */
  readonly displayName: Locator;

  /** GDPR data-transfer dialog — a global overlay that can appear on any page. */
  readonly gdprDialog: GdprDialogComponent;

  /** Student-information interstitial — a global overlay that can appear on any page. */
  readonly studentInfoModal: StudentInfoModalComponent;

  constructor(page: Page) {
    this.page = page;
    this.localeDropdown = page.getByRole('combobox', {name: 'Select language'});
    this.selectedLocale = this.localeDropdown.locator('option:checked');
    this.headerUser = page.locator('.header_user').first();
    this.headerUserMenu = page.locator('#header_user_menu').first();
    this.displayName = page.locator('.display_name').first();
    this.gdprDialog = new GdprDialogComponent(page);
    this.studentInfoModal = new StudentInfoModalComponent(page);
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
   * Rotate the viewport to landscape by swapping its dimensions, the Playwright
   * stand-in for the Cucumber "I rotate to landscape" device step. No-op when
   * already landscape, as the desktop projects here are.
   */
  async rotateToLandscape(): Promise<void> {
    const viewport = this.page.viewportSize();
    if (viewport && viewport.width < viewport.height) {
      await this.page.setViewportSize({
        width: viewport.height,
        height: viewport.width,
      });
    }
  }

  /**
   * Whether the document overflows horizontally. Mirrors the Cucumber step
   * "there is no horizontal scrollbar" via document.documentElement geometry.
   */
  async hasHorizontalScrollbar(): Promise<boolean> {
    return this.page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
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
