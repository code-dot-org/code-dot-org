import {expect, test} from '../fixtures';
import {AccountEditPage} from '../pages/account-edit-page';
import {createStudent, resetSession} from '../shared/auth';
import {analyze, WCAG_AA_TAGS} from '../shared/axe';
import {setCountryOverride} from '../shared/geolocation';

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
// via `bin/rails runner` against this exact CAP_LOCKOUT_DATE.
const BEFORE_CAP_START = '2023-07-02T00:10:47.000Z';

test.describe('Child Account Policy Lockout Phase', () => {
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
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account Under-13 in Colorado created before CAP start cannot change age and state"
   */
  test(
    'Student account Under-13 in Colorado created before CAP start cannot change age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        usState: 'CO',
        createdAt: BEFORE_CAP_START,
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeDisabled();
      await expect(accountEdit.ageSelect).toBeDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account Under-13 not in Colorado created after CAP start can change their age and state"
   */
  test(
    'Student account Under-13 not in Colorado created after CAP start can change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        createdAt: AFTER_CAP_START,
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeEnabled();
      await expect(accountEdit.ageSelect).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account Under-13 not in Colorado created before CAP start can change their age and state"
   */
  test(
    'Student account Under-13 not in Colorado created before CAP start can change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        createdAt: BEFORE_CAP_START,
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeEnabled();
      await expect(accountEdit.ageSelect).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account Over-13 and in Colorado created after CAP start can change their age and state"
   */
  test(
    'Student account Over-13 and in Colorado created after CAP start can change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '16',
        usState: 'CO',
        createdAt: AFTER_CAP_START,
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeEnabled();
      await expect(accountEdit.ageSelect).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account Over-13 and in Colorado created before CAP start can change their age and state"
   */
  test(
    'Student account Over-13 and in Colorado created before CAP start can change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '16',
        usState: 'CO',
        createdAt: BEFORE_CAP_START,
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeEnabled();
      await expect(accountEdit.ageSelect).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account under-13 and in Colorado created after CAP start using only clever cannot change their age and state"
   */
  test(
    'Student account under-13 and in Colorado created after CAP start using only clever cannot change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        usState: 'CO',
        createdAt: AFTER_CAP_START,
        sso: 'clever',
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeDisabled();
      await expect(accountEdit.ageSelect).toBeDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account under-13 and in Colorado created before CAP start using only clever cannot change their age and state"
   */
  test(
    'Student account under-13 and in Colorado created before CAP start using only clever cannot change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        usState: 'CO',
        createdAt: BEFORE_CAP_START,
        sso: 'clever',
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeDisabled();
      await expect(accountEdit.ageSelect).toBeDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account under-13 and in Colorado created before CAP start using google cannot change their age and state"
   */
  test(
    'Student account under-13 and in Colorado created before CAP start using google cannot change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        usState: 'CO',
        createdAt: BEFORE_CAP_START,
        sso: 'google',
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeDisabled();
      await expect(accountEdit.ageSelect).toBeDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account under-13 not in Colorado created after CAP start using clever cannot change their age and state"
   */
  test(
    'Student account under-13 not in Colorado created after CAP start using clever cannot change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        createdAt: AFTER_CAP_START,
        sso: 'clever',
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeEnabled();
      await expect(accountEdit.ageSelect).toBeEnabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: platform/policy_compliance/lockout_phase.feature
   * "Student account under-13 not in Colorado created before CAP start using clever cannot change their age and state"
   */
  test(
    'Student account under-13 not in Colorado created before CAP start using clever cannot change their age and state',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const accountEdit = new AccountEditPage(page);
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        createdAt: BEFORE_CAP_START,
        sso: 'clever',
      });

      await page.goto('/users/edit');

      await expect(accountEdit.ageSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeVisible();
      await expect(accountEdit.usStateSelect).toBeEnabled();
      await expect(accountEdit.ageSelect).toBeEnabled();
    },
  );

  /**
   * Accessibility baseline scan of the account-edit form while a student is
   * locked out. Scoped to #account-information (the account fields CAP disables);
   * an unscoped scan pulls in header/footer chrome unrelated to this feature.
   *
   * EXPECTED_VIOLATIONS is the WCAG AA baseline the form currently ships, as a
   * {rule id: node count} map. The scan must match it exactly: a new or larger
   * violation fails (a regression), and a fixed or smaller one also fails (a
   * happy regression that should shrink this baseline).
   */
  test(
    'locked-out account-edit form matches its documented a11y baseline',
    {tag: ['@no_mobile']},
    async ({page}) => {
      await createStudent(page, {
        name: 'Tandy',
        age: '10',
        usState: 'CO',
        createdAt: BEFORE_CAP_START,
      });
      await page.goto('/users/edit');

      const EXPECTED_VIOLATIONS: Record<string, number> = {
        'color-contrast': 1, // serious: low-contrast text within the account form
      };
      expect(
        await analyze(page, {
          include: '#account-information',
          tags: WCAG_AA_TAGS,
        }),
      ).toEqual(EXPECTED_VIOLATIONS);
    },
  );
});
