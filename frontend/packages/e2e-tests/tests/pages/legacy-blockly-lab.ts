import {expect, type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/** Base for legacy Blockly labs (maze, artist, flappy, ...). */
export class LegacyBlocklyLab extends BasePage {
  /** Instructions tab; its text localizes with the lab locale. */
  readonly instructionsTab: Locator;

  constructor(page: Page) {
    super(page);
    this.instructionsTab = page.locator('.uitest-instructionsTab');
  }

  /** Wait for the lab to be interactive: run button, header, overlay dismissed, header settled. */
  async waitForReady(): Promise<void> {
    await expect(this.page.locator('#runButton')).toBeVisible();
    // .header_user duplicates per breakpoint; .first() avoids strict mode.
    await expect(this.page.locator('.header_user').first()).toBeVisible();
    // Dismiss the instructions overlay if shown (anonymous sessions).
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible()) {
      await overlay.click();
    }
    // Let the header animation finish.
    await expect(this.page.locator('#header_middle_content')).toHaveCSS(
      'opacity',
      '1',
    );
  }

  /** Switch locale via the global dropdown; wait for the lab to reload. */
  async selectLabLocale(label: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(url => url.href.includes('lang='), {
        waitUntil: 'domcontentloaded',
      }),
      this.localeDropdown.selectOption({label}),
    ]);
    await this.waitForReady();
  }
}
