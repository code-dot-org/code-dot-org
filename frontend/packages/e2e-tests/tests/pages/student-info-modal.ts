import {type Locator, type Page} from '@playwright/test';

/**
 * Component object for the student-information interstitial modal. It is
 * rendered from the global application layout
 * (dashboard/app/views/layouts/_student_information_interstitial.html.haml), so
 * it overlays whatever page is showing when a student still owes US state / age
 * info — in these tests, /home. It is a modal, not a page, so it does not
 * extend BasePage.
 */
export class StudentInfoModal {
  private readonly page: Page;

  /** Interstitial heading; visibility signal for the modal. */
  readonly heading: Locator;

  /** US-state dropdown, addressed by its accessible label. */
  readonly stateDropdown: Locator;

  /** Submit button. Located by id; the server-rendered modal exposes no stable role+name. */
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
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
