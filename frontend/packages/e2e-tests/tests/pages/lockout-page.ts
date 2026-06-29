import {type Locator, type Page, type Response} from '@playwright/test';

import {BasePage} from './base-page';

/** Endpoint the lockout form POSTs to for both submit and resend. */
const CHILD_ACCOUNT_CONSENT_URL = '/policy_compliance/child_account_consent';

/**
 * Page object for the CAP lockout panel shown to under-13 accounts that must
 * obtain parental permission. Owns the panel locators and the submit/resend
 * actions; assertions stay in the spec.
 */
export class LockoutPage extends BasePage {
  /** The request form; container for the prompt, deletion note, and status. */
  readonly panelForm: Locator;

  /** Panel heading (.lockout-panel h2), rendered outside the form. */
  readonly heading: Locator;

  /** Parent-permission status chip: Not Submitted / Pending / Granted. */
  readonly permissionStatus: Locator;

  /** Parent-email input. */
  readonly parentEmailInput: Locator;

  /** Submit/Update button; replaced by a spinner while a request is in flight. */
  readonly submitButton: Locator;

  /** Resend-email link, shown only once a request is pending. */
  readonly resendButton: Locator;

  constructor(page: Page) {
    super(page);
    this.panelForm = page.locator('#lockout-panel-form');
    this.heading = page.locator('.lockout-panel h2');
    this.permissionStatus = page.locator('#permission-status');
    this.parentEmailInput = page.locator('#parent-email');
    this.submitButton = page.locator('#lockout-submit');
    this.resendButton = page.locator('#lockout-resend');
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

  /**
   * Submit the request and wait for the permission POST to round-trip. The
   * submit handler is an async thunk, so callers must await this before reload
   * or the navigation races the in-flight request.
   */
  async submit(): Promise<Response> {
    return this.clickAndAwaitConsent(this.submitButton);
  }

  /** Resend the pending request and wait for the permission POST to round-trip. */
  async resend(): Promise<Response> {
    return this.clickAndAwaitConsent(this.resendButton);
  }

  private async clickAndAwaitConsent(button: Locator): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        response =>
          response.url().includes(CHILD_ACCOUNT_CONSENT_URL) &&
          response.request().method() === 'POST',
      ),
      button.click(),
    ]);
    return response;
  }
}
