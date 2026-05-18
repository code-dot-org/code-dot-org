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
   * Fills the email/password page without submitting. Lets the spec take a
   * visual checkpoint before pressing Create my account. Mirrors the Cucumber
   * pre-submit state that captures "Login Type Selection Page".
   */
  async fillEmailAccount(): Promise<void> {
    const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await this.page.locator('#uitest-email').fill(`signup_${suffix}@test.xx`);
    await this.page.locator('#uitest-password').fill('password');
    await this.page.locator('#uitest-confirm-password').fill('password');
    await expect(this.page.locator('#createAccountButton')).toBeEnabled();
  }

  /**
   * Submits the filled email/password page and waits for the next heading.
   */
  async submitEmailAccount(accountType: 'teacher' | 'student'): Promise<void> {
    await this.page.locator('#createAccountButton').click();
    await this.expectFinishAccountHeading(accountType);
  }

  /**
   * Completes the email/password page in one shot.
   *
   * TODO: Eyes parity — Cucumber captures "Login Type Selection Page" between
   * filling and submitting. Callers that need that checkpoint should use
   * fillEmailAccount/submitEmailAccount instead.
   */
  async createEmailAccount(accountType: 'teacher' | 'student'): Promise<void> {
    await this.fillEmailAccount();
    await this.submitEmailAccount(accountType);
  }

  /**
   * Fills the teacher finish-account form without submitting. Lets the spec
   * take a visual checkpoint of the populated form before pressing
   * Go to my account. Mirrors Cucumber's "Finish Sign Up Teacher" capture.
   */
  async fillTeacherAccount(): Promise<void> {
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
  }

  /**
   * Submits the teacher finish-account form and waits for the home page.
   */
  async submitTeacherAccount(): Promise<void> {
    await this.page.getByRole('button', {name: 'Go to my account'}).click();
    await expect(this.page.locator('#teacher-home-header')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Completes the teacher finish-account form in one shot.
   *
   * TODO: Eyes parity — Cucumber captures "Finish Sign Up Teacher" between
   * filling and submitting. Callers that need that checkpoint should use
   * fillTeacherAccount/submitTeacherAccount instead.
   */
  async finishTeacherAccount(): Promise<void> {
    await this.fillTeacherAccount();
    await this.submitTeacherAccount();
  }

  /**
   * Fills the student finish-account form without submitting. Lets the spec
   * take a visual checkpoint of the populated form before pressing
   * Go to my account. Mirrors Cucumber's "Finish Sign Up Student" capture.
   *
   * @param stateLabel - visible US state label
   */
  async fillStudentAccount(
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
  }

  /**
   * Submits the student finish-account form.
   */
  async submitStudentAccount(): Promise<void> {
    await this.page.getByRole('button', {name: 'Go to my account'}).click();
  }

  /**
   * Completes the student finish-account form in one shot.
   *
   * TODO: Eyes parity — Cucumber captures "Finish Sign Up Student" between
   * filling and submitting. Callers that need that checkpoint should use
   * fillStudentAccount/submitStudentAccount instead.
   *
   * @param stateLabel - visible US state label
   */
  async finishStudentAccount(
    stateLabel: 'Washington' | 'Colorado',
  ): Promise<void> {
    await this.fillStudentAccount(stateLabel);
    await this.submitStudentAccount();
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
