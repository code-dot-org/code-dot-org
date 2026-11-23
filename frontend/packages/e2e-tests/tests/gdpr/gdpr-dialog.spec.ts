import {expect, test} from '@playwright/test';

import {HomePage} from '../pages/home-page';
import {
  createEuStudent,
  createUser,
  resetSession,
  signIn,
  signOut,
} from '../shared/auth';
import {setCountryOverride} from '../shared/geolocation';
import {pegasusHost} from '../shared/hosts';

test.describe('GDPR Dialog - data transfer agreement', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "EU user sees the GDPR Dialog on dashboard, opt out"
   * @no_mobile
   */
  test('EU user sees the GDPR Dialog on dashboard, opt out', async ({page}) => {
    const home = new HomePage(page);
    const gdpr = home.gdprDialog;

    await resetSession(page);
    await page.goto('/');
    const rand = Math.floor(Math.random() * 1_000_000);
    await createUser(page, {
      type: 'teacher',
      name: `TestTeacher${rand}`,
      signInCount: 2,
    });

    await setCountryOverride(page, {countryCode: 'ES'});
    await home.goto();
    await expect(gdpr.dialog).toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "EU user sees the GDPR Dialog on dashboard, opt in, don't show again"
   * @no_mobile
   */
  test("EU user sees the GDPR Dialog on dashboard, opt in, don't show again", async ({
    page,
  }) => {
    const home = new HomePage(page);
    const gdpr = home.gdprDialog;

    await resetSession(page);
    await page.goto('/');
    await createUser(page, {
      type: 'teacher',
      name: 'Madame Maxime',
      signInCount: 2,
    });

    await setCountryOverride(page, {countryCode: 'ES'});
    await home.goto();
    await expect(gdpr.dialog).toBeVisible();

    // No UI readiness signal after accept — the dialog hides optimistically
    // via setState before the POST lands. Set up the response listener before
    // the click so the response can't race past us.
    const accepted = page.waitForResponse(
      r => r.url().includes('accept_data_transfer_agreement') && r.ok(),
    );
    await gdpr.acceptDialog();
    await expect(gdpr.dialog).not.toBeVisible();
    await accepted;

    // Reload — dialog must not reappear.
    await home.goto();
    await home.header.waitForSignedIn();
    await expect(gdpr.dialog).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "EU student who accepted on sign up doesn't see the GDPR Dialog"
   * @no_mobile
   */
  test("EU student who accepted on sign up doesn't see the GDPR Dialog", async ({
    page,
  }) => {
    const home = new HomePage(page);
    const gdpr = home.gdprDialog;

    await resetSession(page);
    await page.goto('/');
    await createEuStudent(page, {name: 'Viktor Krum'});

    await setCountryOverride(page, {countryCode: 'ES'});
    await home.goto();
    await home.header.waitForSignedIn();
    await expect(gdpr.dialog).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "GDPR Dialog privacy link works from dashboard"
   * @no_mobile
   */
  test('GDPR Dialog privacy link works from dashboard', async ({page}) => {
    const home = new HomePage(page);
    const gdpr = home.gdprDialog;

    await resetSession(page);
    await page.goto('/');
    const rand = Math.floor(Math.random() * 1_000_000);
    await createUser(page, {
      type: 'teacher',
      name: `TestTeacher${rand}`,
      signInCount: 2,
    });

    await setCountryOverride(page, {countryCode: 'ES'});
    await home.goto();
    // Wait for the dialog heading to confirm the dialog is open. #gdpr-dialog is
    // a zero-height React mount point (absolutely positioned modal content), so
    // Playwright sees it as hidden even when the dialog is open. Use the same
    // .ui-test-gdpr-dialog locator as all other tests.
    await expect(gdpr.dialog).toBeVisible();

    // Dashboard renders this href from the server's own CDO.code_org_url, so the
    // host is the pegasus deployment paired with whatever host the test targets.
    // The value is protocol-relative (//<host>/privacy); resolving it against the
    // page yields a comparable absolute URL either way.
    const href = await gdpr.privacyLink.getAttribute('href');
    expect(href).not.toBeNull();
    const privacyUrl = new URL(href as string, page.url());
    expect(privacyUrl.host).toBe(pegasusHost(page.url()));
    expect(privacyUrl.pathname).toBe('/privacy');
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "Accept, sign out, sign in again, no dialog"
   * @no_mobile
   */
  test('Accept, sign out, sign in again, no dialog', async ({page}) => {
    const home = new HomePage(page);
    const gdpr = home.gdprDialog;

    await resetSession(page);
    await page.goto('/');
    const {email, password} = await createUser(page, {
      type: 'teacher',
      name: 'Madame Maxime',
      signInCount: 2,
    });

    await setCountryOverride(page, {countryCode: 'ES'});
    await home.goto();
    await expect(gdpr.dialog).toBeVisible();

    const accepted = page.waitForResponse(
      r => r.url().includes('accept_data_transfer_agreement') && r.ok(),
    );
    await gdpr.acceptDialog();
    await expect(gdpr.dialog).not.toBeVisible();
    await accepted;

    await signOut(page);

    // Sign back in and navigate home — dialog must not appear.
    await resetSession(page);
    await page.goto('/');
    await signIn(page, {email, password});
    await setCountryOverride(page, {countryCode: 'ES'});
    await home.goto();
    await home.header.waitForSignedIn();
    await expect(gdpr.dialog).not.toBeVisible();
  });
});
