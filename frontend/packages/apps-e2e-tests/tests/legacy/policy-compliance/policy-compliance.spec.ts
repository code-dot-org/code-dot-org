import type {Page} from '@playwright/test';

import {
  mockCapLockoutPhase,
  createCapStudent,
  createCapTeacher,
  createCapSponsoredStudent,
  acceptParentalRequest,
  dismissParentalPermissionModal,
} from '../../shared/cap';
import {expect, test} from '../../shared/fixtures';

/**
 * Child Account Policy — policy compliance scenarios.
 *
 * Source:
 *   dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 *
 * Anonymous; no authentication required — accounts are created fresh per test.
 */

/**
 * Submits a parental permission request through whichever visible request form
 * owns the current interaction. The floating modal can appear after page-load
 * readiness and intercept the account-settings form, so prefer the modal when
 * it is visible.
 *
 * @param page - Playwright page for a CAP-subject student
 * @param email - parent or guardian email address
 */
async function submitParentalPermissionRequest(
  page: Page,
  email: string,
): Promise<void> {
  const modal = page.locator('#parental-permission-modal');

  /**
   * Submit through the floating modal. This path uses visible text rather than
   * `#permission-status` because the modal renders its status paragraph without
   * that id.
   */
  async function submitThroughModal(): Promise<void> {
    await expect(modal).toBeVisible({timeout: 5_000});
    await modal
      .getByRole('textbox', {name: 'Parent/Guardian Email:'})
      .fill(email);
    const sendButton = modal.getByRole('button', {
      name: 'Send permission request',
    });
    await expect(sendButton).toBeEnabled();
    await sendButton.click();
    await expect(modal).toContainText('Pending', {timeout: 15_000});
  }

  if (await modal.isVisible({timeout: 3_000}).catch(() => false)) {
    await submitThroughModal();
    return;
  }

  await page.locator('#parent-email').fill(email);
  await expect(page.locator('#lockout-submit')).toBeEnabled();
  try {
    await page.locator('#lockout-submit').click({timeout: 3_000});
  } catch (error) {
    if (await modal.isVisible({timeout: 1_000}).catch(() => false)) {
      await submitThroughModal();
      return;
    }
    throw error;
  }

  await expect(page.locator('#permission-status')).toContainText('Pending', {
    timeout: 15_000,
  });
}

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 * Scenario: New under 13 account should be able to elect to sign out at the lockout.
 */
test(
  'new under-13 Colorado student after CAP start is redirected to /lockout',
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
  },
);

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 * Scenario: Existing under 13 account in Colorado should not be locked out.
 */
test(
  'existing under-13 Colorado student before CAP start can access /home',
  {tag: '@no_mobile'},
  async ({page}) => {
    await mockCapLockoutPhase(page);
    await createCapStudent(page, {
      young: true,
      colorado: true,
      neverSignedIn: true,
      timing: 'before',
    });

    await page.goto('/');
    await expect(page).toHaveURL(/\/home/, {timeout: 15_000});
  },
);

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 * Scenario: Teacher should be able to connect a third-party account even without a state specified
 */
test(
  'teacher after CAP start can connect a third-party account',
  {tag: '@no_mobile'},
  async ({page}) => {
    await mockCapLockoutPhase(page);
    await createCapTeacher(page, {neverSignedIn: true, timing: 'after'});

    await page.goto('/users/edit');
    await expect(page.locator('#manage-linked-accounts')).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.locator(
        "form[action='/users/auth/google_oauth2?action=connect'] button",
      ),
    ).toBeEnabled({timeout: 10_000});
  },
);

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 * Scenario: Student should not be able to connect a third-party account until their account is unlocked
 */
test(
  'under-13 Colorado student before CAP start: connect buttons locked until parental permission granted',
  {tag: '@no_mobile'},
  async ({page}) => {
    await mockCapLockoutPhase(page);
    await createCapStudent(page, {
      young: true,
      colorado: true,
      neverSignedIn: true,
      timing: 'before',
    });

    await page.goto('/users/edit');
    // The floating ParentalPermissionModal fires on first visit; dismiss it
    // before interacting with the page beneath.
    await dismissParentalPermissionModal(page);
    await expect(page.locator('#manage-linked-accounts')).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.locator(
        "form[action='/users/auth/google_oauth2?action=connect'] button",
      ),
    ).toBeDisabled({timeout: 10_000});

    // Lockout form on account settings page.
    await expect(page.locator('#lockout-linked-accounts-form')).toBeVisible();
    await expect(page.locator('#permission-status')).toContainText(
      'Not Submitted',
    );
    await submitParentalPermissionRequest(page, 'parent@example.com');

    await acceptParentalRequest(page);

    await page.goto('/users/edit');
    await expect(page.locator('#manage-linked-accounts')).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.locator(
        "form[action='/users/auth/google_oauth2?action=connect'] button",
      ),
    ).toBeEnabled({timeout: 10_000});
  },
);

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 * Scenario: Sponsored student should not be able to add a personal email on an account until providing a state
 */
test(
  'sponsored under-13 student without state cannot create personal login until state provided (non-CO state unlocks)',
  {tag: '@no_mobile'},
  async ({page}) => {
    await mockCapLockoutPhase(page);
    await createCapSponsoredStudent(page, {
      authorized: true,
      under13: true,
      timing: 'after',
    });

    await page.goto('/users/edit');
    await expect(
      page.locator('#edit_user_create_personal_account'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      page
        .locator("#edit_user_create_personal_account input[type='password']")
        .first(),
    ).toBeDisabled();
    await expect(
      page.locator('#edit_user_create_personal_account_description'),
    ).toContainText(
      'Uh oh! Please provide your state before creating a personal login.',
    );

    // Pick a non-policy state (Alabama) → password field should become enabled.
    await page
      .locator('#user_us_state')
      .first()
      .selectOption({label: 'Alabama'});
    await page.locator('#submit-update').click();
    await expect(page.locator('div#account-update-success')).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/users/edit');
    await expect(
      page.locator('#edit_user_create_personal_account'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      page
        .locator("#edit_user_create_personal_account input[type='password']")
        .first(),
    ).toBeEnabled();
  },
);

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 * Scenario: Sponsored student should not be able to add a personal email when they supply a policy state
 */
test(
  'sponsored under-13 student selecting Colorado state keeps personal login locked with parental-permission message',
  {tag: '@no_mobile'},
  async ({page}) => {
    await mockCapLockoutPhase(page);
    await createCapSponsoredStudent(page, {
      authorized: true,
      under13: true,
      timing: 'after',
    });

    await page.goto('/users/edit');
    await expect(
      page.locator('#edit_user_create_personal_account'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      page
        .locator("#edit_user_create_personal_account input[type='password']")
        .first(),
    ).toBeDisabled();
    await expect(
      page.locator('#edit_user_create_personal_account_description'),
    ).toContainText(
      'Uh oh! Please provide your state before creating a personal login.',
    );

    // Pick Colorado → field stays disabled; message changes to parental-permission required.
    await page
      .locator('#user_us_state')
      .first()
      .selectOption({label: 'Colorado'});
    await page.locator('#submit-update').click();
    await expect(page.locator('div#account-update-success')).toBeVisible({
      timeout: 15_000,
    });

    await page.goto('/users/edit');
    await expect(
      page.locator('#edit_user_create_personal_account'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      page
        .locator("#edit_user_create_personal_account input[type='password']")
        .first(),
    ).toBeDisabled();
    await expect(
      page.locator('#edit_user_create_personal_account_description'),
    ).toContainText(
      'Uh oh! You must obtain parental permission before creating a personal login.',
    );
  },
);

/**
 * Migration status: COMPLETED
 * Source: dashboard/test/ui/features/platform/policy_compliance/policy_compliance.feature
 * Scenario: Sponsored student is able to add a personal email on an unlocked account
 */
test(
  'sponsored under-13 Colorado student with parental permission can create personal login',
  {tag: '@no_mobile'},
  async ({page}) => {
    await mockCapLockoutPhase(page);
    await createCapSponsoredStudent(page, {
      authorized: true,
      under13: true,
      colorado: true,
      timing: 'after',
    });

    await page.goto('/users/edit');
    await dismissParentalPermissionModal(page);
    await expect(page.locator('#lockout-linked-accounts-form')).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('#permission-status')).toContainText(
      'Not Submitted',
    );
    await page.locator('#parent-email').fill('parent@example.com');
    await expect(page.locator('#lockout-submit')).toBeEnabled();

    await page.locator('#lockout-submit').click();
    await expect(page.locator('#permission-status')).toContainText('Pending', {
      timeout: 15_000,
    });

    await acceptParentalRequest(page);

    await page.goto('/users/edit');
    await dismissParentalPermissionModal(page);
    await expect(
      page.locator('#edit_user_create_personal_account'),
    ).toBeVisible({timeout: 15_000});
    await expect(
      page
        .locator("#edit_user_create_personal_account input[type='password']")
        .first(),
    ).toBeEnabled();
    await expect(page.locator('#permission-status')).toContainText('Granted');
  },
);
