import {expect, type Page} from '@playwright/test';

/**
 * Page object for the regional-partner mini-contact form.
 */
export class RegionalPartnerMiniContactPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the contact page and waits for the form to mount.
   */
  async goto(): Promise<void> {
    await this.page.goto('/professional-learning/contact-regional-partner');
    await expect(
      this.page.locator(
        '#regional-partner-mini-contact-form-contact-regional-partner',
      ),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Enters notes into the required notes field.
   *
   * @param notes - message body
   */
  async fillNotes(notes: string): Promise<void> {
    await this.page.getByLabel('Questions or notes').fill(notes);
  }

  /**
   * Enters a school ZIP code.
   *
   * @param zip - ZIP code
   */
  async fillZip(zip: string): Promise<void> {
    await this.page.getByLabel('School ZIP Code').fill(zip);
  }

  /**
   * Enters an email address.
   *
   * @param email - email address
   */
  async fillEmail(email: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
  }

  /**
   * Clears the email address.
   */
  async clearEmail(): Promise<void> {
    await this.page.getByLabel('Email').fill('');
  }

  /**
   * Submits the mini-contact form.
   */
  async submit(): Promise<void> {
    await this.page.getByRole('button', {name: 'Send'}).click();
  }

  /**
   * Waits for the ZIP validation message.
   */
  async expectZipError(): Promise<void> {
    await expect(
      this.page.locator('#regional-partner-mini-contact-error-zip'),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the email validation message.
   */
  async expectEmailError(): Promise<void> {
    await expect(
      this.page.locator('#regional-partner-mini-contact-error-email'),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the notes validation message.
   */
  async expectNotesError(): Promise<void> {
    await expect(
      this.page.locator('#regional-partner-mini-contact-error-notes'),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the no-regional-partner result.
   */
  async expectNoRegionalPartner(): Promise<void> {
    await expect(
      this.page.locator(
        '#regional-partner-mini-contact-no-rp-in-zip-contact-regional-partner',
      ),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the thank-you result.
   */
  async expectThanks(): Promise<void> {
    await expect(
      this.page.locator(
        '#regional-partner-mini-contact-thanks-contact-regional-partner',
      ),
    ).toBeVisible({timeout: 30_000});
  }
}
