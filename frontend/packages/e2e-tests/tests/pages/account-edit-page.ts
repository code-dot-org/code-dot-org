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

  constructor(page: Page) {
    super(page);
    const form = page.locator('#account-information');
    this.ageSelect = form.getByRole('combobox', {name: /^Age/});
    this.usStateSelect = form.getByRole('combobox', {name: /^State/});
  }
}
