import {type Locator, type Page, type Response} from '@playwright/test';

import {BasePage} from './base-page';

/** Endpoint the lockout form POSTs to for both submit and resend. */
const CHILD_ACCOUNT_CONSENT_URL = '/policy_compliance/child_account_consent';

/**
 * Page object for the CAP lockout panel shown to under-13 accounts that must
 * obtain parental permission. Locators favor accessible roles/labels; assertions
 * stay in the spec.
 */
export class LockoutPage extends BasePage {
  /** The .lockout-panel container; scope and visibility signal for the panel. */
  readonly panel: Locator;

  /** Panel heading; its text varies by state, asserted in the spec. */
  readonly heading: Locator;

  /** Parent-email textbox, addressed by its accessible label. */
  readonly parentEmailInput: Locator;

  /**
   * Submit/Update button. Located by id, not role+name: its accessible name
   * flips between "Send permission request" and "Update and send" by state, so
   * the stable id is the more robust anchor.
   */
  readonly submitButton: Locator;

  /** Resend-email button, shown only once a request is pending. */
  readonly resendButton: Locator;

  /**
   * Parent-permission status value. Located by id: it is a bare <span> with no
   * role or labelable affordance, so there is no accessible handle for it.
   */
  readonly permissionStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.panel = page.locator('.lockout-panel');
    this.heading = this.panel.getByRole('heading');
    this.parentEmailInput = page.getByRole('textbox', {
      name: /Parent\/Guardian Email/,
    });
    this.submitButton = page.locator('#lockout-submit');
    this.resendButton = page.getByRole('button', {
      name: 'Resend permission email',
    });
    this.permissionStatus = page.locator('#permission-status');
  }

  /** Type a parent email into the field. */
  async fillParentEmail(email: string): Promise<void> {
    await this.parentEmailInput.fill(email);
  }

  /** Clear the field and type a new parent email. */
  async replaceParentEmail(email: string): Promise<void> {
    await this.parentEmailInput.clear();
    await this.parentEmailInput.fill(email);
  }

  /** Submit the request. Readiness is observed in the spec via the resulting UI. */
  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  /**
   * Resend the pending request and wait for the permission POST to round-trip.
   * Resend leaves the email and status unchanged, so there is no distinguishing
   * UI signal; the response is the only confirmation the resend was accepted.
   */
  async resend(): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        response =>
          response.url().includes(CHILD_ACCOUNT_CONSENT_URL) &&
          response.request().method() === 'POST',
      ),
      this.resendButton.click(),
    ]);
    return response;
  }
}
