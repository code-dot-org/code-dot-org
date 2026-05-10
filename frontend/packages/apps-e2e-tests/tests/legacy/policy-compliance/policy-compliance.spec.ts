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

test(
  'under-13 Colorado student before CAP start: connect buttons locked until parental permission granted',
  {tag: '@no_mobile'},
  async ({page}) => {
    // Chromium: CAP lockout connect-buttons flaky under parallel run; passes alone.
    test.fixme(
      true,
      'TODO: CAP lockout connect buttons locked check flaky on chromium under parallel run; timing issue with mockCapLockoutPhase or button state',
    );
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
    await page.locator('#parent-email').fill('parent@example.com');
    await expect(page.locator('#lockout-submit')).toBeEnabled();

    await page.locator('#lockout-submit').click();
    await expect(page.locator('#permission-status')).toContainText('Pending', {
      timeout: 15_000,
    });

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
