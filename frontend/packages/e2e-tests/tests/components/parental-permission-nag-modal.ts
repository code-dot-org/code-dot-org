import {errors, type Locator, type Page} from '@playwright/test';

// The modal mounts from a late-loading script rather than with the rest of the
// page, so dismissIfShown waits this long for it to appear before concluding it
// is not coming. Only called from flows where the modal is expected, so this is
// an appearance ceiling, not a routine wait.
const APPEAR_TIMEOUT_MS = 10_000;

/**
 * The "Heads up! Your account may soon be locked." nag modal
 * (ParentalPermissionModal): a global app-layout overlay mounted by a separate
 * script tag whenever the signed-in student has a pending (not yet locked) CAP
 * compliance requirement and no submitted permission request.
 *
 * Its parent-email field carries the same accessible name as the inline lockout
 * forms' field (LockoutPanel/LockoutLinkedAccounts), so while it is present a
 * by-name parent-email locator matches both; its fade-in backdrop can also
 * intercept clicks meant for those forms. (The inline submit button is located
 * by id, which the modal lacks, so it is not itself ambiguous.) Callers driving
 * an inline lockout form should dismiss this first.
 */
export class ParentalPermissionNagModalComponent {
  /** The `#parental-permission-modal` dialog itself. */
  readonly dialog: Locator;

  /**
   * The header close ("X") button. Scoped to the modal header rather than the
   * whole dialog: the update/resend variant also renders a footer button with
   * the same localized "close" label, so a by-name, whole-dialog locator is
   * ambiguous there. The header holds exactly one button, and scoping to it
   * also avoids hard-coding the English label.
   */
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.dialog = page.locator('#parental-permission-modal');
    this.closeButton = this.dialog.locator('.modal-header').getByRole('button');
  }

  /**
   * Dismiss the modal if the app mounts it. The mount is a script-load race, so
   * this waits up to APPEAR_TIMEOUT_MS for it to appear; a timeout — and only a
   * timeout — is taken to mean it never will. Any other failure (page closed,
   * navigation) propagates rather than being swallowed as "not shown".
   */
  async dismissIfShown(): Promise<void> {
    try {
      await this.dialog.waitFor({state: 'visible', timeout: APPEAR_TIMEOUT_MS});
    } catch (error) {
      if (error instanceof errors.TimeoutError) {
        return;
      }
      throw error;
    }
    await this.closeButton.click();
    await this.dialog.waitFor({state: 'hidden'});
  }
}
