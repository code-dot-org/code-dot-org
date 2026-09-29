import {expect, type Locator, type Page} from '@playwright/test';

/** A level-content dialog: legacy BaseDialog (.modal-dialog) or DSCO CustomDialog ([role="dialog"]). */
export class LevelDialogComponent {
  /** :visible matters: OneTrust keeps a hidden [role="dialog"] on every page. */
  readonly dialog: Locator;

  readonly heading: Locator;

  readonly closeButton: Locator;

  constructor(page: Page) {
    this.dialog = page
      .locator('.modal-dialog:visible, [role="dialog"]:visible')
      .first();
    this.heading = this.dialog.locator('.dialog-title, h3');
    this.closeButton = this.dialog.getByRole('button', {name: 'Close'});
  }

  async waitForTitled(title: string): Promise<void> {
    await expect(this.heading).toHaveText(title);
  }

  async close(): Promise<void> {
    await this.closeButton.click();
    // The source paused a fixed 250ms here for the close animation.
    await expect(this.dialog).toBeHidden();
  }
}
