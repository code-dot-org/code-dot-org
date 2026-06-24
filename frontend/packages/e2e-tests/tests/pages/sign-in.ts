import {expect, type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/** The sign-in page. */
export class SignInPage extends BasePage {
  /** The sign-in form container (#signin). Present immediately in server-rendered HTML. */
  readonly signInForm: Locator;

  /** Email/username input. */
  private readonly loginInput: Locator;

  /** Password input. */
  private readonly passwordInput: Locator;

  /** Sign-in submit button (#signin-button). */
  private readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signInForm = page.locator('#signin');
    this.loginInput = page.locator('#user_login');
    this.passwordInput = page.locator('#user_password');
    this.signInButton = page.locator('#signin-button');
  }

  /** Navigate to /users/sign_in and wait for the locale dropdown. */
  async goto(): Promise<void> {
    await this.page.goto('/users/sign_in');
    await this.waitForLocaleDropdownVisible();
  }

  /** Wait for the sign-in form to be present (server-rendered; visible immediately after redirect). */
  async waitForForm(): Promise<void> {
    await expect(this.signInForm).toBeVisible();
  }

  /** Fill the login (email) and password fields. */
  async fillCredentials(email: string, password: string): Promise<void> {
    await this.loginInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /** Click sign-in and wait for the resulting navigation to complete. */
  async submit(): Promise<void> {
    await Promise.all([
      this.page.waitForURL(url => !url.pathname.endsWith('/sign_in'), {
        waitUntil: 'domcontentloaded',
      }),
      this.signInButton.click(),
    ]);
  }

  /** Switch locale via the global dropdown; wait for the full-page nav to settle. */
  async selectLocale(label: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(
        url => url.href.includes('lang=') || !url.pathname.endsWith('/sign_in'),
        {waitUntil: 'domcontentloaded'},
      ),
      this.localeDropdown.selectOption({label}),
    ]);
    await this.waitForLocaleDropdownVisible();
  }
}
