import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the legacy small footer visual smoke tests.
 */
export class FooterPage {
  readonly page: Page;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens a legacy Blockly level and waits for the visible lab/footer signals.
   *
   * @param url - level URL path
   */
  async openLevel(url: string): Promise<void> {
    await this.page.goto(url);
    await expect(this.page.locator('#runButton')).toBeVisible({
      timeout: 60_000,
    });
    await this.dismissInstructionsOverlayIfPresent();
    await this.expectSmallFooter();
  }

  /**
   * Verifies the small footer is mounted.
   */
  async expectSmallFooter(): Promise<void> {
    await expect(this.page.locator('.small-footer-base')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the copyright dialog from the footer and verifies its controls.
   */
  async openCopyrightDialog(): Promise<void> {
    await this.page
      .getByRole('button', {name: /copyright/i})
      .evaluate(element => (element as HTMLElement).click());
    await expect(this.copyrightDialog()).toBeVisible({timeout: 15_000});
  }

  /**
   * Closes the active footer dialog.
   */
  async closeDialog(): Promise<void> {
    await this.page.locator('#ui-close-dialog').click();
    await expect(this.copyrightDialog()).toBeHidden({
      timeout: 15_000,
    });
  }

  /**
   * Opens a footer menu on a share page.
   */
  async openSmallFooterMenu(): Promise<void> {
    const menuButton = this.page.locator('#footerDiv .more-link').first();
    await expect(menuButton).toBeVisible({timeout: 30_000});
    await menuButton.evaluate(element => (element as HTMLElement).click());
    await expect(this.page.locator('#more-menu')).toBeVisible({
      timeout: 15_000,
    });
  }

  /**
   * Selects a named item from the small footer menu.
   *
   * @param itemText - visible item text
   */
  async selectSmallFooterItem(itemText: string): Promise<void> {
    await this.page
      .locator('#footerDiv a', {hasText: itemText})
      .first()
      .click();
  }

  /**
   * Dismisses the first-load instructions curtain if it is blocking controls.
   */
  private async dismissInstructionsOverlayIfPresent(): Promise<void> {
    const overlay = this.page.locator('#overlay');
    if (await overlay.isVisible({timeout: 1_000}).catch(() => false)) {
      await overlay.evaluate(element => (element as HTMLElement).click());
      await overlay.waitFor({state: 'hidden', timeout: 10_000});
    }
  }

  /**
   * Returns the copyright dialog, excluding the persistent OneTrust dialog.
   */
  copyrightDialog(): Locator {
    return this.page.getByRole('dialog', {name: 'Copyright'});
  }
}
