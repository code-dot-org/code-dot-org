import {expect, type Page} from '@playwright/test';

/**
 * Page object for Cucumber's visual page-view smoke scenarios.
 */
export class PageViewsPage {
  /** Playwright page under test. */
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Open a dashboard URL and wait for one of the user-visible readiness signals.
   *
   * @param url - absolute or dashboard-relative URL
   * @param selectors - visible selectors that indicate the page is ready
   */
  async openAndExpectReady(url: string, selectors: string[]): Promise<void> {
    await this.page.goto(this.relativeUrl(url), {
      waitUntil: 'domcontentloaded',
    });
    await this.dismissOptionalOverlays();
    await this.expectAnyVisible(selectors);
  }

  /**
   * Assert the encrypted Play Lab level parsed soft-button properties.
   */
  async expectEncryptedPlayLabButtons(): Promise<void> {
    await expect(this.page.locator('#runButton')).toBeVisible();
    await expect(this.page.locator('#leftButton')).toBeVisible();
  }

  /**
   * Dismiss the language selector overlay if the page presents one.
   */
  async dismissLanguageSelector(): Promise<void> {
    const closeButtons = [
      '.modal-dialog [aria-label="Close"]',
      '.modal-dialog .close',
      '#ui-close-dialog',
    ];

    for (const selector of closeButtons) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible({timeout: 500}).catch(() => false)) {
        await button.click();
        return;
      }
    }
  }

  /**
   * Assert the free-response attachment is not covering the page.
   */
  async expectAttachmentHidden(): Promise<void> {
    await expect(this.page.locator('.uitest-attachment')).toBeHidden();
  }

  /**
   * Convert a studio.code.org URL to the configured Playwright base URL.
   *
   * @param url - absolute or dashboard-relative URL
   * @returns URL suitable for page.goto()
   */
  private relativeUrl(url: string): string {
    if (url.startsWith('http://studio.code.org')) {
      return url.replace('http://studio.code.org', '');
    }
    if (url.startsWith('https://studio.code.org')) {
      return url.replace('https://studio.code.org', '');
    }
    return url;
  }

  /**
   * Dismiss user-visible overlays that obscure the page after initial load.
   */
  private async dismissOptionalOverlays(): Promise<void> {
    const okButton = this.page.getByRole('button', {name: 'OK'}).last();
    if (await okButton.isVisible({timeout: 1000}).catch(() => false)) {
      await okButton.click();
    }

    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 1000}).catch(() => false)) {
      await overlay.evaluate(element => (element as HTMLElement).click());
    }

    await this.dismissLanguageSelector();
  }

  /**
   * Wait for at least one visible selector from a page-specific readiness set.
   *
   * @param selectors - selectors to test in priority order
   */
  private async expectAnyVisible(selectors: string[]): Promise<void> {
    await expect
      .poll(
        async () => {
          for (const selector of selectors) {
            const locator = this.page.locator(selector).first();
            if (await locator.isVisible({timeout: 500}).catch(() => false)) {
              return selector;
            }
          }
          return '';
        },
        {timeout: 45_000},
      )
      .not.toBe('');
  }
}
