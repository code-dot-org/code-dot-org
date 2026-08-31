import {expect, type Locator, type Page} from '@playwright/test';

/**
 * The per-level small footer (SmallFooter.tsx): rendered on lab pages, share
 * pages, and "How it Works" views. Distinct from FooterComponent (the
 * site-wide locale-selector footer).
 */
export class SmallFooterComponent {
  /** Root container; the readiness signal for share-page loads. */
  readonly root: Locator;

  /** "Built on Code Studio" / menu toggle button. */
  readonly menuButton: Locator;

  /** The expanded menu list. */
  readonly menu: Locator;

  /** Copyright icon button rendered inline in the footer base. */
  readonly copyrightButton: Locator;

  /** The copyright modal (AccessibleDialog with aria-label "Copyright"). */
  readonly copyrightDialog: Locator;

  /** Close button inside the copyright modal (#ui-close-dialog). */
  readonly copyrightDialogClose: Locator;

  constructor(page: Page) {
    this.root = page.locator('.small-footer-base');
    this.menuButton = this.root.locator('button.more-link');
    this.menu = page.locator('ul#more-menu');
    this.copyrightButton = page.locator('.copyright-button');
    this.copyrightDialog = page.locator('#copyright-modal');
    this.copyrightDialogClose = page.locator('#ui-close-dialog');
  }

  /** Open the more-menu and wait for it to be visible. */
  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await expect(this.menu).toBeVisible();
  }

  /** Close the more-menu by clicking its toggle again. */
  async closeMenu(): Promise<void> {
    await this.menuButton.click();
    await expect(this.menu).toBeHidden();
  }

  /** Click a named link inside the expanded more-menu. */
  menuItem(name: string): Locator {
    return this.menu.getByRole('link', {name});
  }

  /** Open the menu, then click a menu item. */
  async selectMenuItem(name: string): Promise<void> {
    await this.openMenu();
    await this.menuItem(name).click();
  }

  /** Click the inline copyright button and wait for the dialog to open. */
  async openCopyrightFromBase(): Promise<void> {
    await this.copyrightButton.click();
    await expect(this.copyrightDialog).toBeVisible();
  }

  /** Click a menu item labeled "Copyright" and wait for the dialog. */
  async openCopyrightFromMenu(): Promise<void> {
    await this.menuItem('Copyright').click();
    await expect(this.copyrightDialog).toBeVisible();
  }

  /** Close the copyright dialog via its X button. */
  async closeCopyrightDialog(): Promise<void> {
    await this.copyrightDialogClose.click();
    await expect(this.copyrightDialog).toBeHidden();
  }
}
