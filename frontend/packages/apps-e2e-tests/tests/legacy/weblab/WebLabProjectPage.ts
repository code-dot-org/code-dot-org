import {expect, type Page} from '@playwright/test';

/**
 * Page object for legacy Web Lab project pages.
 */
export class WebLabProjectPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens a new Web Lab project and waits for the Bramble editor.
   */
  async gotoNewProject(): Promise<void> {
    await this.page.goto('/projects/weblab/new');
    await expect(this.page.locator('.user_menu')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('iframe').first()).toBeVisible();
  }

  /**
   * Asserts the nested Bramble iframe contents have loaded.
   */
  async expectEditorLoaded(): Promise<void> {
    const brambleFrame = this.page.frameLocator('iframe').first();
    await expect(brambleFrame.locator('#bramble')).toBeVisible({
      timeout: 60_000,
    });
    await expect(brambleFrame.locator('iframe').first()).toBeVisible();
    await expect(
      brambleFrame.frameLocator('iframe').first().locator('#editor-holder'),
    ).toBeVisible({timeout: 60_000});
  }
}
