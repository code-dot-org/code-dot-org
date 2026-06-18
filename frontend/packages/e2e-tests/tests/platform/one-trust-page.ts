import {expect} from '@playwright/test';

import {BasePage} from '../pages/base-page';

/** Page object for OneTrust-related interactions across studio.code.org. */
export class OneTrustPage extends BasePage {
  /** Navigate to a path; waits for domcontentloaded. */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Navigate to /home with otreset+otgeo params and wait for the app to
   * process the reset (URL changes to contain otreset=false).
   */
  async gotoHomeWithOtReset(): Promise<void> {
    await this.page.goto('/home?otreset=true&otgeo=es');
    await expect(this.page).toHaveURL(/otreset=false/, {timeout: 15_000});
  }

  /**
   * Wait for the OneTrust banner element to be visible. The container
   * (#onetrust-consent-sdk) appears before the banner child — wait on the
   * banner itself (#onetrust-banner-sdk) per the readiness table.
   */
  async waitForOtBannerVisible(): Promise<void> {
    await expect(this.page.locator('#onetrust-banner-sdk')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Assert a CSS selector matches at least one element in the DOM.
   * Uses toBeAttached() which checks DOM presence without requiring visibility.
   */
  async expectScriptExists(selector: string): Promise<void> {
    await expect(this.page.locator(selector).first()).toBeAttached();
  }

  /** Assert no elements match the CSS selector. */
  async expectScriptAbsent(selector: string): Promise<void> {
    await expect(this.page.locator(selector)).toHaveCount(0);
  }

  /**
   * Assert that all script elements matching selector have no
   * optanon-category-* class (i.e. are not categorized by OneTrust).
   *
   * OT runs its classification pass shortly after DOMContentLoaded.
   * We poll until the SDK has had a chance to initialize (indicated by the
   * OptanonWrapper or the OT banner SDK script loading), then assert absence.
   * Since essential scripts are intentionally never categorized, the condition
   * is stable — we poll until OT has initialized or 5 s elapse.
   */
  async expectNotCategorizedByOneTrust(selector: string): Promise<void> {
    // Poll until OT SDK has run (its banner script tag appears) or 5 s pass.
    await this.page
      .waitForFunction(
        () =>
          document.querySelector(
            "script[src*='otBannerSdk'], script[src*='otSDKStub']",
          ) !== null,
        undefined,
        {timeout: 5_000},
      )
      .catch(() => {
        /* OT scripts may be absent (off mode); proceed to assertion. */
      });

    const hasCategory = await this.page.evaluate((sel: string) => {
      const els = Array.from(document.querySelectorAll(sel));
      return els.some(e =>
        (e as HTMLScriptElement).className.includes('optanon-category-'),
      );
    }, selector);

    if (hasCategory) {
      throw new Error(
        `Script elements matching "${selector}" are categorized by OneTrust — expected none to have optanon-category-* class`,
      );
    }
  }

  /**
   * Replace /edit with /embed in the current URL and append query params,
   * then navigate to the embed URL. Mirrors steps.rb
   * "I switch to the embedded view of current project".
   */
  async switchToEmbeddedView(query: string): Promise<void> {
    const embedUrl = this.page.url().replace('/edit', '/embed') + '?' + query;
    await this.page.goto(embedUrl);
  }
}
