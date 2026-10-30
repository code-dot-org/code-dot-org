import {expect, test} from '../fixtures';
import {LockoutPage} from '../pages/lockout-page';
import {createStudent, resetSession} from '../shared/auth';

// CO lockout date pinned into the past so every CO account sits in the all-user
// lockout phase. Mirrors cap_steps.rb's @cap_lockout_date and the CO default in
// state_policies.rb (DateTime.parse('2024-07-01T00:00:00MDT')); keep in sync if
// that default moves. Each student's created_at equals it, which marks the
// account post-policy because the policy check uses a strict `<`.
const CAP_LOCKOUT_DATE = '2024-07-01T06:00:00.000Z';

// Shared setup for the students these scenarios create: under-13, never signed
// in, placed in the lockout phase. Scenarios add usState / parentCreated.
const LOCKED_STUDENT = {
  name: 'Sally Student',
  age: '10',
  signInCount: 0,
  createdAt: CAP_LOCKOUT_DATE,
  // create_user already signs the student in; skip the extra Warden sign-in so
  // sign_in_count stays 0 ("never signed in") and the locked account is not
  // re-authenticated.
  signInAfterCreate: false,
} as const;

// Exact on-screen copy from the lockout panel (apps/i18n/common/en_us.json),
// asserted in full to match the original Cucumber contract.
const SESSION_LOCKOUT_PROMPT =
  'We need your parent or guardian to approve your account before you can get ' +
  "started. Please supply us with your parent or guardian's email address so " +
  'they can grant you permission.';
const SESSION_LOCKOUT_DELETION_NOTE =
  'Note: Your account will be deleted if we do not receive your parent or ' +
  "guardian's permission by:";
const SESSION_LOCKOUT_PENDING_PROMPT =
  "We sent an email to parent@example.com. Didn't receive anything? Update " +
  "your parent or guardian's email below or send another request.";

test.describe('Policy Compliance - Parental Permission', () => {
  test.beforeEach(async ({page, dcdo}) => {
    await resetSession(page);
    await page.goto('/');
    await dcdo.mock('cap_CO_lockout_date_override', CAP_LOCKOUT_DATE);
  });

  /**
   * Source: policy_compliance/parental_permission.feature
   * "New under 13 account should be able to send a parental request."
   */
  test(
    'New under 13 account should be able to send a parental request',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lockout = new LockoutPage(page);
      await createStudent(page, {...LOCKED_STUDENT, usState: 'CO'});
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.heading).toContainText('Just one more thing!');
      await expect(lockout.permissionStatus).toContainText('Not Submitted');
      await expect(lockout.panel).toContainText(SESSION_LOCKOUT_PROMPT);
      await expect(lockout.panel).toContainText(SESSION_LOCKOUT_DELETION_NOTE);

      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();

      await expect(lockout.permissionStatus).toContainText('Pending');
      await expect(lockout.heading).toContainText(
        "Thanks! We've contacted your parent/guardian.",
      );
      await expect(lockout.panel).toContainText(SESSION_LOCKOUT_PENDING_PROMPT);
      await expect(lockout.panel).toContainText(SESSION_LOCKOUT_DELETION_NOTE);
    },
  );

  /**
   * Source: policy_compliance/parental_permission.feature
   * "New under 13 account should be able to provide state and see lockout page to send parental request."
   */
  test(
    'New under 13 account should be able to provide state and see lockout page to send parental request',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lockout = new LockoutPage(page);
      const modal = lockout.studentInfoModal;
      await createStudent(page, {...LOCKED_STUDENT});
      await page.goto('/home?forceStudentInterstitial=true');

      await expect(modal.heading).toBeVisible();
      await modal.selectState('Colorado');
      await modal.submit();

      await expect(lockout.panel).toBeVisible();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();

      await expect(lockout.permissionStatus).toContainText('Pending');
    },
  );

  /**
   * Source: policy_compliance/parental_permission.feature
   * "New under 13 account should be able to resend the email"
   */
  test(
    'New under 13 account should be able to resend the email',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lockout = new LockoutPage(page);
      await createStudent(page, {...LOCKED_STUDENT, usState: 'CO'});
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();
      await expect(lockout.permissionStatus).toContainText('Pending');

      const resendResponse = await lockout.resend();
      expect(resendResponse.ok()).toBeTruthy();
    },
  );

  /**
   * Source: policy_compliance/parental_permission.feature
   * "New under 13 account should be able to send a different email"
   */
  test(
    'New under 13 account should be able to send a different email',
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lockout = new LockoutPage(page);
      await createStudent(page, {...LOCKED_STUDENT, usState: 'CO'});
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();
      await expect(lockout.permissionStatus).toContainText('Pending');

      await lockout.replaceParentEmail('parent2@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();
      // The pending prompt reflects the new email only after the update commits;
      // wait for it before reloading so the reload sees the persisted value.
      await expect(lockout.panel).toContainText(
        'We sent an email to parent2@example.com',
      );

      await page.reload();
      await expect(lockout.panel).toBeVisible();
      await expect(lockout.parentEmailInput).toHaveValue('parent2@example.com');
    },
  );

  /**
   * Source: policy_compliance/parental_permission.feature
   * "Student should not be able to enter their own email as their parent's email"
   */
  test(
    "Student should not be able to enter their own email as their parent's email",
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lockout = new LockoutPage(page);
      const {email} = await createStudent(page, {
        ...LOCKED_STUDENT,
        usState: 'CO',
      });
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail(email);
      await expect(lockout.submitButton).toBeDisabled();
    },
  );

  /**
   * Source: policy_compliance/parental_permission.feature
   * "Student should be able to enter their parent's email if their parent created their account"
   */
  test(
    "Student should be able to enter their parent's email if their parent created their account",
    {tag: ['@no_mobile']},
    async ({page}) => {
      const lockout = new LockoutPage(page);
      const {email} = await createStudent(page, {
        ...LOCKED_STUDENT,
        usState: 'CO',
        parentCreated: true,
      });
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail(email);
      await expect(lockout.submitButton).toBeEnabled();
    },
  );
});
