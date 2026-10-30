import {type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/**
 * Page object for /users/edit (RegistrationsController#edit). Age and US-state
 * are the two comboboxes in the #account-information React mount, located by
 * role within that mount. Scoping to the mount excludes the "Finish creating
 * your account" interstitial (#student-information-modal), which reuses the same
 * labels/ids for its own always-enabled selects when the account is missing
 * that info and sits earlier in the DOM — an unscoped locator (as the original
 * Cucumber `$('#user_us_state')[0]` did) can read the modal element instead of
 * the real form control for not-yet-in-Colorado students.
 *
 * The name regexes are start-anchored: SimpleDropdown wraps the <select> in a
 * <label> that also holds the lockout helper message when disabled, so the
 * accessible name gains a suffix in exactly the disabled state these tests
 * assert. Anchoring matches the stable "Age"/"State" label prefix across both
 * states.
 */
export class AccountEditPage extends BasePage {
  /** The student's age <select>; disabled while in the CAP lockout flow. */
  readonly ageSelect: Locator;

  /** The student's US-state <select>; disabled while in the CAP lockout flow. */
  readonly usStateSelect: Locator;

  /**
   * "Update account information" submit button. Located by id: it sits inside
   * `#account-information`, whose PUT /users response (204, no body) is
   * followed by an app-initiated full-page reload to /users/edit — the
   * caller should assert on `updateSuccessBanner` rather than the click
   * itself.
   */
  readonly submitUpdateButton: Locator;

  /**
   * Success banner shown after the reload that follows a successful account
   * update. Absent from the DOM entirely before that reload, not merely
   * hidden.
   */
  readonly updateSuccessBanner: Locator;

  /** Mount point for the ManageLinkedAccounts React component. */
  readonly manageLinkedAccountsSection: Locator;

  /**
   * The "Connect" button for linking a Google account. Scoped by the
   * surrounding form's action attribute, not by accessible name: every
   * provider's Connect button shares the same name, so the form is the only
   * way to distinguish which provider's button this is (CSS is a last
   * resort here since there is no id/label on the button itself).
   */
  readonly googleConnectButton: Locator;

  /**
   * "Create personal login" section (CreatePersonalLogin.tsx). Preserved by
   * id in the component specifically for this suite to locate by.
   */
  readonly personalLoginForm: Locator;

  /**
   * Password input within `personalLoginForm`; disabled while gated by
   * state/parental-permission. Scoped to `input[name="user[password]"]`
   * rather than `input[type="password"]`: the form also renders a
   * password_confirmation field of the same type, and an unscoped selector
   * resolves to both (strict-mode violation).
   */
  readonly personalLoginPasswordInput: Locator;

  /** Copy explaining why `personalLoginForm` is gated (state vs. parental permission). */
  readonly personalLoginDescription: Locator;

  constructor(page: Page) {
    super(page);
    const form = page.locator('#account-information');
    this.ageSelect = form.getByRole('combobox', {name: /^Age/});
    this.usStateSelect = form.getByRole('combobox', {name: /^State/});
    this.submitUpdateButton = page.locator('#submit-update');
    this.updateSuccessBanner = page.locator('div#account-update-success');
    this.manageLinkedAccountsSection = page.locator('#manage-linked-accounts');
    this.googleConnectButton = page
      .locator('form[action="/users/auth/google_oauth2?action=connect"]')
      .locator('button');
    this.personalLoginForm = page.locator('#edit_user_create_personal_account');
    this.personalLoginPasswordInput = this.personalLoginForm.locator(
      'input[name="user[password]"]',
    );
    this.personalLoginDescription = page.locator(
      '#edit_user_create_personal_account_description',
    );
  }
}
