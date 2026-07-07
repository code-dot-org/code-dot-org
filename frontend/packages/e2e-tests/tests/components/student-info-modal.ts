import {type Locator, type Page} from '@playwright/test';

/** The student-information interstitial: a global app-layout overlay, not a page. */
export class StudentInfoModalComponent {
  private readonly page: Page;

  readonly heading: Locator;

  readonly stateDropdown: Locator;

  /** By id: the server-rendered modal has no stable role+name. */
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', {
      name: /Finish creating your account/,
    });
    this.stateDropdown = page.getByRole('combobox', {name: 'State'});
    this.submitButton = page.locator('#submit-btn');
  }

  async selectState(label: string): Promise<void> {
    await this.stateDropdown.selectOption({label});
  }

  /** Waits for the /lockout redirect so a later navigation can't race it. */
  async submit(): Promise<void> {
    await this.submitButton.click();
    await this.page.waitForURL(/\/lockout/);
  }
}
