import {expect, type Page} from '@playwright/test';

import {mockDcdo} from '../../shared/cookies';

/**
 * Page object for the React sign-up flow.
 */
export class SignUpPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the account-type screen and waits for both account cards.
   */
  async gotoAccountType(): Promise<void> {
    await this.page.goto('/users/sign_up/account_type');
    await expect(
      this.page.getByRole('heading', {name: 'Create your free account'}),
    ).toBeVisible({timeout: 30_000});
    await expect(
      this.page.getByRole('button', {name: 'Sign up as a teacher'}),
    ).toBeVisible();
    await expect(
      this.page.getByRole('button', {name: 'Sign up as a student'}),
    ).toBeVisible();
  }

  /**
   * Enables the CAP sign-up path through the same DCDO cookie used by Cucumber.
   */
  async mockCpaExperience(): Promise<void> {
    await mockDcdo(this.page, 'cpa_experience', true);
  }

  /**
   * Chooses teacher account type.
   */
  async chooseTeacher(): Promise<void> {
    await this.page.getByRole('button', {name: 'Sign up as a teacher'}).click();
    await this.expectLoginTypeForm();
  }

  /**
   * Chooses student account type.
   */
  async chooseStudent(): Promise<void> {
    await this.page.getByRole('button', {name: 'Sign up as a student'}).click();
    await this.expectLoginTypeForm();
  }

  /**
   * Completes the email/password page.
   */
  async createEmailAccount(accountType: 'teacher' | 'student'): Promise<void> {
    const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await this.page.locator('#uitest-email').fill(`signup_${suffix}@test.xx`);
    await this.page.locator('#uitest-password').fill('password');
    await this.page.locator('#uitest-confirm-password').fill('password');
    // Visual checkpoint stub: Cucumber captured the login-type selection page.
    await expect(this.page.locator('#createAccountButton')).toBeEnabled();
    await this.page.locator('#createAccountButton').click();
    await this.expectFinishAccountHeading(accountType);
  }

  /**
   * Completes the teacher finish-account form.
   */
  async finishTeacherAccount(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: /Finish creating your teacher account/i,
      }),
    ).toBeVisible({timeout: 30_000});
    await this.page.locator('#uitest-given-name').fill('myFirstName');
    await this.page.locator('#uitest-family-name').fill('myLastName');
    await this.page.locator('#uitest-display-name').fill('myDisplayName');
    await this.page.getByText('Select all that apply').click();
    await this.page.getByText('Found on search').click();
    await this.page.keyboard.press('Escape');
    await this.page.locator('#uitest-country-dropdown').selectOption('US');
    await this.page.locator('#uitest-school-zip').fill('31513');
    await expect(this.page.locator('#uitest-school-dropdown')).toContainText(
      'Appling County High School',
      {timeout: 30_000},
    );
    await this.page
      .locator('#uitest-school-dropdown')
      .selectOption({label: 'Appling County High School'});
    await this.page
      .locator('#uitest-educator-role')
      .selectOption({label: 'Classroom Teacher'});
    await this.page.keyboard.press('Escape');
    // Visual checkpoint stub: Cucumber captured the teacher finish page.
    await this.page.getByRole('button', {name: 'Go to my account'}).click();
    await expect(this.page.locator('#teacher-home-header')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Completes the student finish-account form.
   *
   * @param stateLabel - visible US state label
   */
  async finishStudentAccount(
    stateLabel: 'Washington' | 'Colorado',
  ): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: /Finish creating your student account/i,
      }),
    ).toBeVisible({timeout: 30_000});
    await this.page.locator('#uitest-display-name').fill('myDisplayName');
    await this.page.locator('#uitest-user-age').selectOption({label: '10'});
    await this.page
      .locator('#uitest-user-state')
      .selectOption({label: stateLabel});
    // Visual checkpoint stub: Cucumber captured the student finish page.
    await this.page.getByRole('button', {name: 'Go to my account'}).click();
  }

  /**
   * Asserts the signed-up student reached their home page.
   */
  async expectStudentHome(): Promise<void> {
    await expect(this.page).toHaveURL(/\/home/, {timeout: 30_000});
    await expect(this.page.locator('#sign_in_or_user')).toBeVisible();
  }

  /**
   * Asserts the Colorado CAP lockout page is visible.
   */
  async expectColoradoLockout(): Promise<void> {
    await expect(this.page).toHaveURL(/\/lockout/, {timeout: 30_000});
    await expect(
      this.page.getByText(/parental permission|permission/i).first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Waits for the email/password page.
   */
  private async expectLoginTypeForm(): Promise<void> {
    await expect(this.page.locator('#uitest-email')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Waits for the next sign-up page by visible heading.
   *
   * @param accountType - selected account type
   */
  private async expectFinishAccountHeading(
    accountType: 'teacher' | 'student',
  ): Promise<void> {
    await expect(
      this.page.getByRole('heading', {
        name: new RegExp(`Finish creating your ${accountType} account`, 'i'),
      }),
    ).toBeVisible({timeout: 60_000});
  }
}
