import {type Locator, type Page} from '@playwright/test';

/**
 * The "Heads up! Your account may soon be locked." nag modal
 * (ParentalPermissionModal): a global app-layout overlay mounted by a
 * separate script tag whenever the signed-in student has a pending (not yet
 * locked) CAP compliance requirement and no submitted permission request.
 *
 * It duplicates the parent-email field and submit button of the inline
 * lockout forms (LockoutPanel/LockoutLinkedAccounts) with the same accessible
 * names, and its own script mounts asynchronously relative to the rest of the
 * page — so it can appear mid-test and either make those inline locators
 * ambiguous or have its fade-in backdrop intercept clicks meant for them.
 * Callers driving an inline lockout form should dismiss this first.
 */
export class ParentalPermissionNagModalComponent {
  /** The `#parental-permission-modal` dialog itself. */
  readonly dialog: Locator;

  /** Close ("X") button in the modal header. */
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.dialog = page.locator('#parental-permission-modal');
    this.closeButton = this.dialog.getByRole('button', {name: 'Close'});
  }

  /**
   * Dismiss the modal if the app mounts it. Its mount is a script-load race
   * relative to the rest of the page rather than an immediate render, so this
   * waits for it to appear instead of checking just once; a timeout is taken
   * to mean it was never going to show.
   */
  async dismissIfShown(): Promise<void> {
    const shown = await this.dialog
      .waitFor({state: 'visible', timeout: 15_000})
      .then(() => true)
      .catch(() => false);
    if (!shown) {
      return;
    }
    await this.closeButton.click();
    await this.dialog.waitFor({state: 'hidden'});
  }
}
