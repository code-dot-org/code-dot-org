import {type Locator, type Page} from '@playwright/test';

/** The GDPR data-transfer-agreement dialog: a global app-layout overlay (#gdpr-dialog), not a page. */
export class GdprDialogComponent {
  /** The dialog heading — present and visible when the dialog is shown. */
  readonly dialog: Locator;

  /** Accept ("Yes") button inside the dialog. */
  readonly acceptButton: Locator;

  /**
   * Privacy-policy link inside the #gdpr-dialog container. Its href attribute
   * is protocol-relative (//code.org/privacy); the browser resolves it to
   * https://code.org/privacy.
   */
  readonly privacyLink: Locator;

  /** The #gdpr-dialog container; used for scoping child locators. */
  readonly gdprContainer: Locator;

  constructor(page: Page) {
    this.dialog = page.locator('.ui-test-gdpr-dialog');
    this.acceptButton = page.locator('.ui-test-gdpr-dialog-accept');
    this.gdprContainer = page.locator('#gdpr-dialog');
    this.privacyLink = this.gdprContainer.getByRole('link', {
      name: /Visit CodeAI/,
    });
  }

  /** Click the accept button. */
  async acceptDialog(): Promise<void> {
    await this.acceptButton.click();
  }
}
