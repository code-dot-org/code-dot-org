import {mockCapLockoutPhase, createCapStudent} from '../../shared/cap';
import {expect, test} from '../../shared/fixtures';

/**
 * Child Account Policy — parental permission flow.
 *
 * Source:
 *   dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature
 */

test.describe('Parental permission — /lockout page flow', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature
   * Scenario: New under 13 account should be able to send a parental request.
   */
  test(
    'new under-13 Colorado student can submit a parental permission request',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        colorado: true,
        neverSignedIn: true,
        timing: 'after',
      });
      await page.goto('/');
      await expect(page).toHaveURL(/\/lockout/, {timeout: 15_000});

      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator('#permission-status')).toContainText(
        'Not Submitted',
      );
      await expect(page.locator('.lockout-panel h2')).toContainText(
        'Just one more thing!',
      );
      await expect(
        page.locator('#lockout-panel-form > p:nth-child(1)'),
      ).toContainText(
        'We need your parent or guardian to approve your account before you can get started.',
      );
      await expect(
        page.locator('#lockout-panel-form > p:nth-child(2)'),
      ).toContainText(
        'Note: Your account will be deleted if we do not receive your parent or guardian',
      );

      await page.locator('#parent-email').fill('parent@example.com');
      await expect(page.locator('#lockout-submit')).toBeEnabled();

      await page.locator('#lockout-submit').click();
      await expect(page.locator('#permission-status')).toContainText(
        'Pending',
        {
          timeout: 15_000,
        },
      );
      await expect(page.locator('.lockout-panel h2')).toContainText(
        "Thanks! We've contacted your parent/guardian.",
      );
      await expect(
        page.locator('#lockout-panel-form > p:nth-child(1)'),
      ).toContainText('We sent an email to parent@example.com.');
      await expect(
        page.locator('#lockout-panel-form > p:nth-child(2)'),
      ).toContainText(
        'Note: Your account will be deleted if we do not receive your parent or guardian',
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature
   * Scenario: New under 13 account should be able to provide state and see lockout page to send parental request.
   */
  test(
    'student without state sees interstitial, picks Colorado, then sees lockout',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        neverSignedIn: true,
        timing: 'after',
      });

      // Navigate to home with the force-interstitial query param.
      await page.goto('/home?forceStudentInterstitial=true');
      await expect(page.locator('#student-information-modal')).toBeVisible({
        timeout: 15_000,
      });

      await page.locator('#user_us_state').selectOption({
        label: 'Colorado',
      });
      // "I press '#submit-btn' using jQuery" → dispatchEvent click.
      await page.locator('#submit-btn').dispatchEvent('click');

      // ajax:success reloads the page; with CO+young+after CAP the server
      // redirects to /lockout immediately.
      await expect(page).toHaveURL(/\/lockout/, {timeout: 15_000});
      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator('#permission-status')).toContainText(
        'Not Submitted',
      );

      await page.locator('#parent-email').fill('parent@example.com');
      await expect(page.locator('#lockout-submit')).toBeEnabled();

      await page.locator('#lockout-submit').click();
      await expect(page.locator('#permission-status')).toContainText(
        'Pending',
        {
          timeout: 15_000,
        },
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature
   * Scenario: New under 13 account should be able to resend the email
   */
  test(
    'student can resend the parental permission email',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        colorado: true,
        neverSignedIn: true,
        timing: 'after',
      });
      await page.goto('/');
      await expect(page).toHaveURL(/\/lockout/, {timeout: 15_000});

      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });
      await page.locator('#parent-email').fill('parent@example.com');
      await expect(page.locator('#lockout-submit')).toBeEnabled();

      await page.locator('#lockout-submit').click();
      await expect(page.locator('#permission-status')).toContainText(
        'Pending',
        {
          timeout: 15_000,
        },
      );

      await page.locator('#lockout-resend').click();
      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature
   * Scenario: New under 13 account should be able to send a different email
   */
  test(
    'student can update the parent email address',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      await createCapStudent(page, {
        young: true,
        colorado: true,
        neverSignedIn: true,
        timing: 'after',
      });
      await page.goto('/');
      await expect(page).toHaveURL(/\/lockout/, {timeout: 15_000});

      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });
      await page.locator('#parent-email').fill('parent@example.com');
      await expect(page.locator('#lockout-submit')).toBeEnabled();

      await page.locator('#lockout-submit').click();
      await expect(page.locator('#permission-status')).toContainText(
        'Pending',
        {
          timeout: 15_000,
        },
      );

      // Change to a different email and resubmit.
      await page.locator('#parent-email').fill('');
      await page.locator('#parent-email').fill('parent2@example.com');
      await expect(page.locator('#lockout-submit')).toBeEnabled();

      await page.locator('#lockout-submit').click();
      await expect(page.locator('#lockout-submit')).toBeVisible({
        timeout: 15_000,
      });

      await page.reload();
      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });
      await expect(page.locator('#parent-email')).toHaveValue(
        'parent2@example.com',
      );
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature
   * Scenario: Student should not be able to enter their own email as their parent's email
   */
  test(
    'student cannot enter their own email as the parent email',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      const {email} = await createCapStudent(page, {
        young: true,
        colorado: true,
        neverSignedIn: true,
        timing: 'after',
      });
      await page.goto('/');
      await expect(page).toHaveURL(/\/lockout/, {timeout: 15_000});

      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });

      // Entering own email should disable the submit button.
      await page.locator('#parent-email').fill(email);
      await expect(page.locator('#lockout-submit')).toBeDisabled();
    },
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/policy_compliance/parental_permission.feature
   * Scenario: Student should be able to enter their parent's email if their parent created their account
   */
  test(
    'student whose account was parent-created can enter parent email (same as own)',
    {tag: '@no_mobile'},
    async ({page}) => {
      await mockCapLockoutPhase(page);
      const {email} = await createCapStudent(page, {
        young: true,
        colorado: true,
        neverSignedIn: true,
        timing: 'after',
        parentCreated: true,
      });
      await page.goto('/');
      await expect(page).toHaveURL(/\/lockout/, {timeout: 15_000});

      await expect(page.locator('#lockout-panel-form')).toBeVisible({
        timeout: 15_000,
      });

      // For parent-created accounts, own email IS valid as parent email.
      await page.locator('#parent-email').fill(email);
      await expect(page.locator('#lockout-submit')).toBeEnabled();
    },
  );
});
