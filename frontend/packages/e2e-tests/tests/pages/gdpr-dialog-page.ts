import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/** Page object for the GDPR data-transfer-agreement dialog on /home. */
export class GdprDialogPage extends BasePage {
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
    super(page);
    this.dialog = page.locator('.ui-test-gdpr-dialog');
    this.acceptButton = page.locator('.ui-test-gdpr-dialog-accept');
    this.gdprContainer = page.locator('#gdpr-dialog');
    this.privacyLink = this.gdprContainer.getByRole('link', {
      name: /Visit CodeAI/,
    });
  }

  /** Navigate to /home. */
  async goto(): Promise<void> {
    await this.page.goto('/home');
  }

  /** Click the accept button. */
  async acceptDialog(): Promise<void> {
    await this.acceptButton.click();
  }
}
