import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/**
 * Page object for the student-information interstitial that collects a
 * student's US state on the first home visit.
 */
export class StudentInfoModalPage extends BasePage {
  /** Interstitial heading; visibility signal for the modal. */
  readonly heading: Locator;

  /** US-state dropdown, addressed by its accessible label. */
  readonly stateDropdown: Locator;

  /** Submit button. Located by id; the server-rendered modal exposes no stable role+name. */
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', {
      name: /Finish creating your account/,
    });
    this.stateDropdown = page.getByRole('combobox', {name: 'State'});
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
