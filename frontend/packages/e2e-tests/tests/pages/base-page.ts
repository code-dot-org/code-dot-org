import {expect, type Locator, type Page} from '@playwright/test';

import {CookieBannerComponent} from '../components/cookie-banner';
import {FooterComponent} from '../components/footer';
import {GdprDialogComponent} from '../components/gdpr-dialog';
import {HeaderComponent} from '../components/header';
import {OneTrustComponent} from '../components/one-trust';
import {ParentalPermissionNagModalComponent} from '../components/parental-permission-nag-modal';
import {StudentInfoModalComponent} from '../components/student-info-modal';

/** Base for every page object — home for the UI common to all pages. */
export class BasePage {
  protected readonly page: Page;

  /** Site-wide navigation header (nav links, user menu, display name). */
  readonly header: HeaderComponent;

  /** Site-wide page footer (language selector). */
  readonly footer: FooterComponent;

  /** GDPR data-transfer dialog — a global overlay that can appear on any page. */
  readonly gdprDialog: GdprDialogComponent;

  /** Student-information interstitial — a global overlay that can appear on any page. */
  readonly studentInfoModal: StudentInfoModalComponent;

  /** OneTrust cookie-consent banner and SDK script tags. */
  readonly oneTrust: OneTrustComponent;

  /** Legacy GDPR cookie-consent banner — a global overlay that can appear on any page. */
  readonly cookieBanner: CookieBannerComponent;

  /** Site-wide CAP parental-permission nag modal — a global overlay that can appear on any page. */
  readonly parentalPermissionNagModal: ParentalPermissionNagModalComponent;

  /**
   * The main content landmark (#main_content) from the application layout —
   * present on every page and the "skip to main content" link target. Scope
   * page content to this to exclude global overlays (header, OneTrust, etc.).
   * The raw selector is exposed too: axe's include() needs a CSS string, not
   * the locator.
   */
  readonly mainContentSelector = '#main_content';
  readonly mainContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = new HeaderComponent(page);
    this.footer = new FooterComponent(page);
    this.gdprDialog = new GdprDialogComponent(page);
    this.studentInfoModal = new StudentInfoModalComponent(page);
    this.oneTrust = new OneTrustComponent(page);
    this.cookieBanner = new CookieBannerComponent(page);
    this.parentalPermissionNagModal = new ParentalPermissionNagModalComponent(
      page,
    );
    this.mainContent = page.locator(this.mainContentSelector);
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

  /** Navigate to a path, optionally within a Global Edition region. */
  async goto({
    path,
    globalRegion,
  }: {
    path: string;
    globalRegion?: string;
  }): Promise<void> {
    if (!globalRegion) {
      await this.page.goto(path);
      return;
    }
    // A fresh context drops the ge_region Set-Cookie on the 302 redirect
    // follow unless the origin has been visited once first. Warm up with a
    // plain root navigation, set+confirm the region, then land on the target.
    await this.page.goto('/');
    await this.switchToGlobalEditionRegion(globalRegion);
    await this.page.goto(`/${globalRegion}${path}`);
    await expect(this.globalEditionRegionHtml(globalRegion)).toBeVisible();
  }

  /**
   * Click the shared instructions overlay if present, no wait for it to hide.
   * Mirrors the Cucumber step "I close the instructions overlay if it exists"
   * (a plain click-if-visible; contrast LegacyBlocklyLab.waitForReady()'s
   * fuller OK-button retry loop for levels that gate boot on this dismissal).
   */
  async closeInstructionsOverlayIfShown(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible()) {
      await overlay.click();
    }
  }

  /**
   * Assert the free-response Attachments widget has settled past its
   * transient "Loading..." placeholder. Cucumber: 'element ".uitest-attachment"
   * is not visible' — run unconditionally on every case of the Scenario
   * Outline it came from, not just free response; harmless elsewhere since
   * toBeHidden() also passes when the selector matches nothing.
   */
  async assertAttachmentsWidgetSettled(): Promise<void> {
    await expect(this.page.locator('.uitest-attachment')).toBeHidden();
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
