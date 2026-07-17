import {expect, test} from '../fixtures';
import {AccountEditPage} from '../pages/account-edit-page';
import {LockoutPage} from '../pages/lockout-page';
import {
  acceptParentalRequest,
  createStudent,
  createTeacherAssociatedStudent,
  createUser,
  resetSession,
} from '../shared/auth';
import {setCountryOverride} from '../shared/geolocation';
import {expectElementHasI18nText} from '../shared/i18n';

// CO lockout date pinned into the past so every CO account sits in the all-user
// lockout phase. Mirrors cap_steps.rb's @cap_lockout_date and the CO default in
// state_policies.rb (DateTime.parse('2024-07-01T00:00:00MDT')); keep in sync if
// that default moves.
const CAP_LOCKOUT_DATE = '2024-07-01T06:00:00.000Z';

// "after CAP start" created_at, per cap_steps.rb.
const AFTER_CAP_START = CAP_LOCKOUT_DATE;

// "before CAP start" created_at: @cap_start_date - 1.second, where
// @cap_start_date = @cap_lockout_date.ago(1.year), per cap_steps.rb. DateTime#ago
// applies ActiveSupport's average Gregorian year (365.2425 days), not a plain
// calendar-year subtraction, so this is not exactly one year earlier; verified
// via `bin/rails runner` against this exact CAP_LOCKOUT_DATE (see lockout-phase.spec.ts).
const BEFORE_CAP_START = '2023-07-02T00:10:47.000Z';

// Shared setup for the students these scenarios create: under-13, never signed
// in, placed in the lockout phase. Scenarios add usState / createdAt overrides.
const LOCKED_STUDENT = {
  age: '10',
  signInCount: 0,
  createdAt: AFTER_CAP_START,
  // create_user already signs the student in; skip the extra Warden sign-in so
  // sign_in_count stays 0 ("never signed in") and the locked account is not
  // re-authenticated.
  signInAfterCreate: false,
} as const;

test.describe('Policy Compliance', () => {
  test.beforeEach(async ({page, dcdo}) => {
    await resetSession(page);
    await page.goto('/');
    // #user_us_state renders only for US-geolocated requests
    // (RegistrationsController#edit derives @is_usa from request.country_code);
    // pin the country so the state field is present regardless of runner IP.
    await setCountryOverride(page, {countryCode: 'US'});
    await dcdo.mock('cap_CO_lockout_date_override', CAP_LOCKOUT_DATE);
  });

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/policy_compliance.feature
   * "New under 13 account should be able to elect to sign out at the lockout."
   */
  test(
    'New under 13 account should be able to elect to sign out at the lockout.',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lockout = new LockoutPage(page);
      await createStudent(page, {
        ...LOCKED_STUDENT,
        name: 'Sally Student',
        usState: 'CO',
      });

      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.panelForm).toBeVisible();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/policy_compliance.feature
   * "Existing under 13 account in Colorado should not be locked out."
   */
  test(
    'Existing under 13 account in Colorado should not be locked out.',
    {tag: ['@no_mobile']},
    async ({page}) => {
      await createStudent(page, {
        ...LOCKED_STUDENT,
        name: 'Sally Student',
        usState: 'CO',
        createdAt: BEFORE_CAP_START,
      });

      await page.goto('/home');
      await expect(page).toHaveURL(url => url.pathname === '/home');
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/policy_compliance.feature
   * "Teacher should be able to connect a third-party account even without a state specified"
   */
  test(
    'Teacher should be able to connect a third-party account even without a state specified',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createUser(page, {
        type: 'teacher',
        name: 'Amstrad Teacher',
        signInCount: 0,
        signInAfterCreate: false,
        extraFields: {created_at: AFTER_CAP_START},
      });

      await page.goto('/users/edit');
      await expect(accountEdit.manageLinkedAccountsSection).toBeVisible();
      await expect(accountEdit.googleConnectButton).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/policy_compliance.feature
   * "Student should not be able to connect a third-party account until their account is unlocked"
   */
  test(
    'Student should not be able to connect a third-party account until their account is unlocked',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      const lockout = new LockoutPage(page);
      await createStudent(page, {
        ...LOCKED_STUDENT,
        name: 'Coco Student',
        usState: 'CO',
        createdAt: BEFORE_CAP_START,
      });

      await page.goto('/users/edit');
      await expect(accountEdit.manageLinkedAccountsSection).toBeVisible();
      await expect(accountEdit.googleConnectButton).toBeDisabled();

      await expect(lockout.linkedAccountsForm).toBeVisible();
      // The site-wide nag modal duplicates this form's fields under the same
      // accessible names and mounts asynchronously; dismiss it first so it
      // can't intercept clicks meant for the inline form below.
      await accountEdit.parentalPermissionNagModal.dismissIfShown();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');
      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();

      await lockout.submit();
      await expect(lockout.permissionStatus).toContainText('Pending');

      await acceptParentalRequest(page);

      await page.goto('/users/edit');
      await expect(accountEdit.manageLinkedAccountsSection).toBeVisible();
      await expect(accountEdit.googleConnectButton).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/policy_compliance.feature
   * "Sponsored student should not be able to add a personal email on an account until providing a state"
   */
  test(
    'Sponsored student should not be able to add a personal email on an account until providing a state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createTeacherAssociatedStudent(page, {
        studentName: 'Tandy',
        authorized: true,
        sponsored: true,
        age: '10',
        createdAt: AFTER_CAP_START,
      });

      await page.goto('/users/edit');
      await expect(accountEdit.personalLoginForm).toBeVisible();
      await expect(accountEdit.personalLoginPasswordInput).toBeDisabled();
      await expectElementHasI18nText({
        locator: accountEdit.personalLoginDescription,
        locale: 'en-US',
        key: 'user.create_personal_login_state_required',
      });

      await accountEdit.usStateSelect.selectOption({label: 'Alabama'});
      await accountEdit.submitUpdateButton.click();
      await expect(accountEdit.updateSuccessBanner).toBeVisible();

      await page.goto('/users/edit');
      await expect(accountEdit.personalLoginForm).toBeVisible();
      await expect(accountEdit.personalLoginPasswordInput).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/policy_compliance.feature
   * "Sponsored student should not be able to add a personal email when they supply a policy state"
   */
  test(
    'Sponsored student should not be able to add a personal email when they supply a policy state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createTeacherAssociatedStudent(page, {
        studentName: 'Tandy',
        authorized: true,
        sponsored: true,
        age: '10',
        createdAt: AFTER_CAP_START,
      });

      await page.goto('/users/edit');
      await expect(accountEdit.personalLoginForm).toBeVisible();
      await expect(accountEdit.personalLoginPasswordInput).toBeDisabled();
      await expectElementHasI18nText({
        locator: accountEdit.personalLoginDescription,
        locale: 'en-US',
        key: 'user.create_personal_login_state_required',
      });

      await accountEdit.usStateSelect.selectOption({label: 'Colorado'});
      await accountEdit.submitUpdateButton.click();
      await expect(accountEdit.updateSuccessBanner).toBeVisible();

      await page.goto('/users/edit');
      await expect(accountEdit.personalLoginForm).toBeVisible();
      await expect(accountEdit.personalLoginPasswordInput).toBeDisabled();
      await expectElementHasI18nText({
        locator: accountEdit.personalLoginDescription,
        locale: 'en-US',
        key: 'user.create_personal_login_parental_permission_required',
      });
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/policy_compliance.feature
   * "Sponsored student is able to add a personal email on an unlocked account"
   */
  test(
    'Sponsored student is able to add a personal email on an unlocked account',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      const lockout = new LockoutPage(page);
      await createTeacherAssociatedStudent(page, {
        studentName: 'Tandy',
        authorized: true,
        sponsored: true,
        age: '10',
        usState: 'CO',
        createdAt: AFTER_CAP_START,
      });

      await page.goto('/users/edit');
      await expect(lockout.linkedAccountsForm).toBeVisible();
      // The site-wide nag modal duplicates this form's fields under the same
      // accessible names and mounts asynchronously; dismiss it first so it
      // can't intercept clicks meant for the inline form below.
      await accountEdit.parentalPermissionNagModal.dismissIfShown();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');
      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();

      await lockout.submit();
      await expect(lockout.permissionStatus).toContainText('Pending');

      await acceptParentalRequest(page);

      await page.goto('/users/edit');
      await expect(accountEdit.personalLoginForm).toBeVisible();
      await expect(accountEdit.personalLoginPasswordInput).toBeEnabled();
      await expect(lockout.permissionStatus).toContainText('Granted');
    },
  );
});
