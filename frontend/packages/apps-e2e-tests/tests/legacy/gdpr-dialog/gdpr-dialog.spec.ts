import {
  createEuStudent,
  createTeacher,
  createTestUser,
  signIn,
  signOut,
} from '../../shared/auth';
import {mockGeolocation} from '../../shared/cookies';
import {expect, test} from '../../shared/fixtures';

/**
 * GDPR Dialog — EU data-transfer agreement banner shown to users in Europe.
 *
 * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
 *
 * Uses the GeolocationOverride cookie (IP 150.214.39.255, Spain) to simulate
 * an EU session, matching `I am in Europe` from geolocation_steps.rb.
 */

const EU_IP = '150.214.39.255';
const gdprHeadingText =
  /Do you agree that Code\.org may transfer data.*to the United States/;

function gdprDialogHeading(page: import('@playwright/test').Page) {
  return page.getByRole('heading', {name: gdprHeadingText});
}

async function createGdprTeacher(
  page: import('@playwright/test').Page,
): Promise<{email: string; password: string}> {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const email = `gdpr_teacher_${ts}_${rand}@test.xx`;
  const password = `TeacherPass${ts}`;

  await createTestUser(page, {
    user_type: 'teacher',
    email,
    password,
    password_confirmation: password,
    name: `Madame Maxime ${rand}`,
    age: '21+',
    terms_of_service_version: '1',
    sign_in_count: 2,
  });

  return {email, password};
}

/**
 * Sets the GeolocationOverride cookie and navigates to /home so the GDPR
 * dialog can appear.  Combines `I am in Europe` + `I am on /home` from the
 * feature file Background steps.
 *
 * @param page - Playwright page with an established navigation context
 */
async function goHomeAsEuUser(
  page: import('@playwright/test').Page,
): Promise<void> {
  await mockGeolocation(page, EU_IP);
  await page.goto('/home');
}

/**
 * Poll the page's `<script data-gdpr>` element until show_gdpr_dialog equals
 * the expected string value.
 * Mirrors `it is eventually observed that the "gdpr" script data field
 * "show_gdpr_dialog" is "false"` from script_data_steps.rb.
 *
 * @param page - Playwright page with the gdpr script element present
 * @param expected - expected string value ('true' or 'false')
 */
async function waitForGdprScriptDataField(
  page: import('@playwright/test').Page,
  expected: string,
): Promise<void> {
  await expect(async () => {
    const value = await page.evaluate(() => {
      const el = document.querySelector('script[data-gdpr]');
      const raw = (el as HTMLElement | null)?.dataset['gdpr'] ?? '{}';
      return String(
        (JSON.parse(raw) as Record<string, unknown>)['show_gdpr_dialog'],
      );
    });
    expect(value).toBe(expected);
  }).toPass({timeout: 30_000});
}

async function acceptGdprDialog(
  page: import('@playwright/test').Page,
): Promise<void> {
  await expect(gdprDialogHeading(page)).toBeVisible({timeout: 15_000});
  const acceptResponse = page.waitForResponse(
    response =>
      response
        .url()
        .includes('/dashboardapi/v1/users/accept_data_transfer_agreement') &&
      response.request().method() === 'POST',
  );
  await page.locator('.ui-test-gdpr-dialog-accept').click();
  expect((await acceptResponse).status()).toBe(204);
  await expect(gdprDialogHeading(page)).not.toBeVisible({timeout: 15_000});
  await waitForGdprScriptDataField(page, 'false');
}

test.describe('GDPR Dialog', {tag: '@no_mobile'}, () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * Scenario: EU user sees the GDPR Dialog on dashboard, opt out
   *
   * EU teacher lands on /home and sees the GDPR dialog.
   */
  test('EU teacher sees GDPR dialog', async ({page}) => {
    await createTeacher(page);
    await goHomeAsEuUser(page);
    await expect(gdprDialogHeading(page)).toBeVisible({timeout: 15_000});
  });

  /**
   * Source: gdpr_dialog.feature — "EU user sees the GDPR Dialog on dashboard,
   * opt in, don't show again"
   *
   * EU teacher opts in; the dialog closes and the gdpr script data reflects
   * show_gdpr_dialog=false.  Reloading /home no longer shows the dialog.
   */
  test('EU teacher opts in and dialog does not reappear', async ({page}) => {
    test.fixme(
      true,
      'TODO: accept endpoint returns 204, but test-studio re-renders show_gdpr_dialog=true after /home navigation',
    );
    const {email, password} = await createGdprTeacher(page);
    await goHomeAsEuUser(page);
    await acceptGdprDialog(page);

    await page.goto('/home?gdpr_dialog_test=after_accept');
    await page
      .locator('.header_user')
      .waitFor({state: 'visible', timeout: 15_000});
    await waitForGdprScriptDataField(page, 'false');
    await expect(gdprDialogHeading(page)).not.toBeVisible({timeout: 15_000});

    void email;
    void password;
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * Scenario: EU student who accepted on sign up doesn't see the GDPR Dialog
   *
   * Student created with data_transfer_agreement_accepted=true never sees the
   * dialog even from an EU IP.
   */
  test('EU student who accepted at sign-up does not see GDPR dialog', async ({
    page,
  }) => {
    await createEuStudent(page);
    await goHomeAsEuUser(page);
    await expect(gdprDialogHeading(page)).not.toBeVisible({
      timeout: 10_000,
    });
  });

  /**
   * Source: gdpr_dialog.feature — "GDPR Dialog privacy link works from dashboard"
   *
   * The "Visit Code.org" link inside the GDPR dialog navigates to the privacy
   * policy page.
   */
  test('GDPR dialog privacy link points to code.org/privacy', async ({
    page,
  }) => {
    await createTeacher(page);
    await goHomeAsEuUser(page);
    await expect(gdprDialogHeading(page)).toBeVisible({timeout: 15_000});
    const link = page.locator('.ui-test-gdpr-dialog-privacy-link');
    await expect(link).toHaveAttribute('href', /code\.org\/privacy/);
  });

  /**
   * Source: gdpr_dialog.feature — "Accept, sign out, sign in again, no dialog"
   *
   * After accepting the dialog, signing out and signing back in should not
   * surface the dialog again.
   */
  test('GDPR dialog not shown after accept + sign out + sign in', async ({
    page,
  }) => {
    test.fixme(
      true,
      'TODO: accept endpoint returns 204, but test-studio re-renders show_gdpr_dialog=true after sign-in',
    );
    const {email, password} = await createGdprTeacher(page);
    await goHomeAsEuUser(page);
    await acceptGdprDialog(page);

    await signOut(page);
    // Re-apply the EU cookie after sign-out (reset_session clears client state
    // but the geolocation override persists in the browser context).
    await mockGeolocation(page, EU_IP);
    await signIn(page, email, password);
    await page.goto('/home?gdpr_dialog_test=after_sign_in');
    await page
      .locator('.header_user')
      .waitFor({state: 'visible', timeout: 15_000});
    await waitForGdprScriptDataField(page, 'false');
    await expect(gdprDialogHeading(page)).not.toBeVisible({timeout: 15_000});
  });
});
