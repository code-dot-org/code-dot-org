import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/**
 * Page object for the student-information interstitial modal that collects a
 * student's US state on the first home visit.
 */
export class StudentInfoModalPage extends BasePage {
  /** The interstitial modal container. */
  readonly modal: Locator;

  /** US-state dropdown. */
  readonly stateDropdown: Locator;

  /** Submit button. */
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.locator('#student-information-modal');
    this.stateDropdown = page.locator('#user_us_state');
    this.submitButton = page.locator('#submit-btn');
  }

  /** Select a US state by its visible label (e.g. "Colorado"). */
  async selectState(label: string): Promise<void> {
    await this.stateDropdown.selectOption({label});
  }

  /**
   * Submit the modal and wait for the resulting redirect to the lockout page.
   * Submitting triggers a server redirect; waiting for the URL avoids racing a
   * navigation against an in-flight one.
   */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(/\/lockout/);
  }
}
