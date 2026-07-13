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

  /** Sign-in submit button (#signin-button). Locale-agnostic (id-based). */
  readonly signInButton: Locator;

  /** Section code input (#section_code). */
  private readonly sectionCodeInput: Locator;

  /** "Go" button in the section sign-in form. Its label is untranslated in every locale. */
  readonly sectionSignInButton: Locator;

  /** "Create an account" link on the logged-out / link-account page. */
  readonly createAccountLink: Locator;

  /** Sign-in heading ("Have an account already? Sign in"). */
  readonly heading: Locator;

  /** Main content landmark — scope for the region's visual check. */
  readonly mainContent: Locator;

  /** "Want to try coding?" heading (#code_without_signing_in). Id-based: its text is under test. */
  readonly codeWithoutSigningInHeading: Locator;

  /** Google OAuth button (#google_oauth2-sign-in). Id-based: label is the text under test. */
  readonly googleSignInButton: Locator;

  /** Microsoft OAuth button (#microsoft_v2_auth-sign-in). Id-based: label is the text under test. */
  readonly microsoftSignInButton: Locator;

  /** Facebook OAuth button (#facebook-sign-in). Id-based: label is the text under test. */
  readonly facebookSignInButton: Locator;

  /** Clever OAuth button (#clever-sign-in). Id-based: label is the text under test. */
  readonly cleverSignInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signInForm = page.locator('#signin');
    this.loginInput = page.locator('#user_login');
    this.passwordInput = page.locator('#user_password');
    this.signInButton = page.locator('#signin-button');
    this.sectionCodeInput = page.locator('#section_code');
    this.sectionSignInButton = page.getByRole('button', {
      name: 'Go',
      exact: true,
    });
    this.createAccountLink = page.getByRole('link', {
      name: 'Create an account',
    });
    this.heading = page.getByRole('heading', {level: 2}).first();
    this.mainContent = page.getByRole('main');
    this.codeWithoutSigningInHeading = page.locator('#code_without_signing_in');
    this.googleSignInButton = page.locator('#google_oauth2-sign-in');
    this.microsoftSignInButton = page.locator('#microsoft_v2_auth-sign-in');
    this.facebookSignInButton = page.locator('#facebook-sign-in');
    this.cleverSignInButton = page.locator('#clever-sign-in');
  }

  /** Navigate to /users/sign_in, optionally in a Global Edition region. */
  async goto({region}: {region?: string} = {}): Promise<void> {
    await this.navigate('/users/sign_in', {region});
    if (!region) await this.footer.waitForLocaleDropdownVisible();
  }

  /** Wait for the sign-in form to be present (server-rendered; visible immediately after redirect). */
  async waitForForm(): Promise<void> {
    await expect(this.signInForm).toBeVisible();
  }

  /** Fill the login (email) and password fields. */
  async fillCredentials({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<void> {
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

  /** Type the section code into the section code input. */
  async fillSectionCode(code: string): Promise<void> {
    await this.sectionCodeInput.fill(code);
  }

  /**
   * Click the Go button in the section sign-in area and wait for the resulting
   * navigation to complete (server redirects to /logged_out).
   */
  async submitSectionCode(): Promise<void> {
    await Promise.all([
      this.page.waitForURL(url => url.pathname.includes('/logged_out'), {
        waitUntil: 'domcontentloaded',
      }),
      this.sectionSignInButton.click(),
    ]);
  }

  /** Switch locale via the global dropdown; wait for the full-page nav to settle. */
  async selectLocale(label: string): Promise<void> {
    await Promise.all([
      this.page.waitForURL(
        url => url.href.includes('lang=') || !url.pathname.endsWith('/sign_in'),
        {waitUntil: 'domcontentloaded'},
      ),
      this.footer.localeDropdown.selectOption({label}),
    ]);
    await this.footer.waitForLocaleDropdownVisible();
  }

  /** A link by its visible text, scoped to the sign-in form (#signin). Locale-agnostic. */
  linkInSignInForm(text: string): Locator {
    return this.signInForm.getByRole('link', {name: text});
  }

  /** Course tile link in "try without signing in" section; CSS scope avoids ambiguity with nav links. */
  quickStartLink(text: string): Locator {
    return this.page
      .locator('#code_without_signing_in + .row')
      .getByRole('link')
      .filter({hasText: text});
  }
}
