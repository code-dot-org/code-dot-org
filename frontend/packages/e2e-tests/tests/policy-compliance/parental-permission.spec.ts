import {type Page} from '@playwright/test';

import {expect, test} from '../fixtures';
import {LockoutPage} from '../pages/lockout-page';
import {StudentInfoModalPage} from '../pages/student-info-modal-page';
import {requestWithCsrf} from '../shared/api';
import {resetSession} from '../shared/auth';

// CO lockout date pinned into the past so every CO account sits in the all-user
// lockout phase. Mirrors cap_steps.rb's @cap_lockout_date and the CO default in
// state_policies.rb (DateTime.parse('2024-07-01T00:00:00MDT')); keep in sync if
// that default moves. createYoungStudent sets created_at equal to it, which
// marks the account post-policy because the policy check uses a strict `<`.
const CAP_LOCKOUT_DATE = '2024-07-01T06:00:00.000Z';

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

interface YoungStudentOptions {
  /** Give the student a Colorado address so /home redirects straight to /lockout. */
  inColorado: boolean;
  /**
   * Pre-populate the student's own email as the parent-permission email, as if
   * a parent created the account with it (permits the student to re-enter it).
   */
  parentCreated?: boolean;
}

/**
 * Create an under-13 "never signed in" student via /api/test/create_user and
 * sign them in. The page must already be on the target host. Returns the
 * created email so callers can assert against it.
 */
async function createYoungStudent(
  page: Page,
  {inColorado, parentCreated = false}: YoungStudentOptions,
): Promise<string> {
  const timestamp = Date.now();
  const rand = Math.floor(Math.random() * 1_000_000);
  const email = `cap_student_${timestamp}_${rand}@test.xx`;
  const password = 'student_password';

  const user: Record<string, string | number> = {
    user_type: 'student',
    email,
    password,
    password_confirmation: password,
    name: 'Sally Student',
    age: '10',
    terms_of_service_version: '1',
    // Every Cucumber scenario creates the student "who has never signed in".
    sign_in_count: 0,
    created_at: CAP_LOCKOUT_DATE,
  };

  if (inColorado) {
    user.country_code = 'US';
    user.us_state = 'CO';
    user.user_provided_us_state = 'true';
  }

  if (parentCreated) {
    user.parent_email_preference_opt_in_required = '1';
    user.parent_email_preference_opt_in = 'no';
    user.parent_email_preference_email = email;
    user.parent_email_preference_request_ip = '127.0.0.1';
    user.parent_email_preference_source = 'ACCOUNT_SIGN_UP';
  }

  const {ok, status} = await requestWithCsrf(
    page,
    'POST',
    '/api/test/create_user',
    {user},
  );
  if (!ok) {
    throw new Error(`create_user failed: ${status}`);
  }

  return email;
}

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
      await createYoungStudent(page, {inColorado: true});
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.panelForm).toBeVisible();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');
      await expect(lockout.heading).toContainText('Just one more thing!');
      await expect(lockout.panelForm).toContainText(SESSION_LOCKOUT_PROMPT);
      await expect(lockout.panelForm).toContainText(
        SESSION_LOCKOUT_DELETION_NOTE,
      );

      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();

      await expect(lockout.permissionStatus).toContainText('Pending');
      await expect(lockout.heading).toContainText(
        "Thanks! We've contacted your parent/guardian.",
      );
      await expect(lockout.panelForm).toContainText(
        SESSION_LOCKOUT_PENDING_PROMPT,
      );
      await expect(lockout.panelForm).toContainText(
        SESSION_LOCKOUT_DELETION_NOTE,
      );
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
      const modal = new StudentInfoModalPage(page);
      const lockout = new LockoutPage(page);
      await createYoungStudent(page, {inColorado: false});
      await page.goto('/home?forceStudentInterstitial=true');

      await expect(modal.modal).toBeVisible();
      await modal.selectState('Colorado');
      await modal.submit();

      await expect(lockout.panelForm).toBeVisible();
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
      await createYoungStudent(page, {inColorado: true});
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.panelForm).toBeVisible();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();
      await expect(lockout.permissionStatus).toContainText('Pending');

      const resendResponse = await lockout.resend();
      expect(resendResponse.ok()).toBeTruthy();
      await expect(lockout.panelForm).toBeVisible();
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
      await createYoungStudent(page, {inColorado: true});
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.panelForm).toBeVisible();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail('parent@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();
      await expect(lockout.permissionStatus).toContainText('Pending');

      await lockout.replaceParentEmail('parent2@example.com');
      await expect(lockout.submitButton).toBeEnabled();
      await lockout.submit();

      await page.reload();
      await expect(lockout.panelForm).toBeVisible();
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
      const studentEmail = await createYoungStudent(page, {inColorado: true});
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.panelForm).toBeVisible();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail(studentEmail);
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
      const studentEmail = await createYoungStudent(page, {
        inColorado: true,
        parentCreated: true,
      });
      await page.goto('/home');
      await expect(page).toHaveURL(/\/lockout/);

      await expect(lockout.panelForm).toBeVisible();
      await expect(lockout.permissionStatus).toContainText('Not Submitted');

      await lockout.fillParentEmail(studentEmail);
      await expect(lockout.submitButton).toBeEnabled();
    },
  );
});
