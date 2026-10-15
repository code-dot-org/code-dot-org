import {type Locator, type Page} from '@playwright/test';

/**
 * Legacy GDPR cookie-consent banner. Shown in GDPR regions, or in test/dev via
 * the show_cookie_banner_on_test URL param. Superseded by OneTrustComponent
 * when the onetrust_cookie_scripts experiment is active, so it now covers a
 * shrinking slice of traffic.
 */
export class CookieBannerComponent {
  /** Scope a11y scans and visual checks to this. */
  readonly rootSelector = '#cookie-banner';

  readonly banner: Locator;

  /**
   * By id, not text: the label is translated (I18n.t('cookie_banner.accept')).
   * Clicking it only sets a client-side cookie — no network round-trip to wait on.
   */
  readonly acceptButton: Locator;

  constructor(page: Page) {
    this.banner = page.locator(this.rootSelector);
    this.acceptButton = this.banner.locator('#accept-cookies');
  }

  async accept(): Promise<void> {
    await this.acceptButton.click();
  }
}
