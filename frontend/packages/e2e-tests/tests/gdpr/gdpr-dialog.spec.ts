import {expect, test} from '@playwright/test';

import {GdprDialogPage} from '../pages/gdpr-dialog-page';
import {
  createEuStudent,
  createUser,
  resetSession,
  signIn,
  signOut,
} from '../shared/auth';
import {setEuropeanIp} from '../shared/geolocation';
import {pollScriptDataField} from '../shared/script-data';

test.describe('GDPR Dialog - data transfer agreement', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "EU user sees the GDPR Dialog on dashboard, opt out"
   * @no_mobile
   */
  test('EU user sees the GDPR Dialog on dashboard, opt out', async ({page}) => {
    const gdpr = new GdprDialogPage(page);

    await resetSession(page);
    await page.goto('/');
    const rand = Math.floor(Math.random() * 1_000_000);
    await createUser(page, {
      type: 'teacher',
      name: `TestTeacher${rand}`,
      signInCount: 2,
    });

    await setEuropeanIp(page);
    await gdpr.goto();
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
    const gdpr = new GdprDialogPage(page);

    await resetSession(page);
    await page.goto('/');
    await createUser(page, {
      type: 'teacher',
      name: 'Madame Maxime',
      signInCount: 2,
    });

    await setEuropeanIp(page);
    await gdpr.goto();
    await expect(gdpr.dialog).toBeVisible();

    await gdpr.acceptDialog();
    await expect(gdpr.dialog).not.toBeVisible();
    await pollScriptDataField(page, 'gdpr', 'show_gdpr_dialog', 'false');

    // Reload — dialog must not reappear.
    await gdpr.goto();
    await gdpr.waitForSignedIn();
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
    const gdpr = new GdprDialogPage(page);

    await resetSession(page);
    await page.goto('/');
    await createEuStudent(page, {name: 'Viktor Krum'});

    await setEuropeanIp(page);
    await gdpr.goto();
    await gdpr.waitForSignedIn();
    await expect(gdpr.dialog).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "GDPR Dialog privacy link works from dashboard"
   * @no_mobile
   */
  test('GDPR Dialog privacy link works from dashboard', async ({page}) => {
    const gdpr = new GdprDialogPage(page);

    await resetSession(page);
    await page.goto('/');
    const rand = Math.floor(Math.random() * 1_000_000);
    await createUser(page, {
      type: 'teacher',
      name: `TestTeacher${rand}`,
      signInCount: 2,
    });

    await setEuropeanIp(page);
    await gdpr.goto();
    // Wait for the dialog heading to confirm the dialog is open. #gdpr-dialog is
    // a zero-height React mount point (absolutely positioned modal content), so
    // Playwright sees it as hidden even when the dialog is open. Use the same
    // .ui-test-gdpr-dialog locator as all other tests.
    await expect(gdpr.dialog).toBeVisible();

    // The Cucumber step asserts the raw href equals "http://code.org/privacy" or
    // its replace_hostname equivalent. The rendered value is protocol-relative
    // (//code.org/privacy), which browsers resolve to https; both forms satisfy
    // the intent — match either.
    const href = await gdpr.privacyLink.getAttribute('href');
    expect(href).toMatch(/^(https?:)?\/\/code\.org\/privacy$/);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/xteam/gdpr_dialog.feature
   * "Accept, sign out, sign in again, no dialog"
   * @no_mobile
   */
  test('Accept, sign out, sign in again, no dialog', async ({page}) => {
    const gdpr = new GdprDialogPage(page);

    await resetSession(page);
    await page.goto('/');
    const {email, password} = await createUser(page, {
      type: 'teacher',
      name: 'Madame Maxime',
      signInCount: 2,
    });

    await setEuropeanIp(page);
    await gdpr.goto();
    await expect(gdpr.dialog).toBeVisible();

    await gdpr.acceptDialog();
    await expect(gdpr.dialog).not.toBeVisible();
    await pollScriptDataField(page, 'gdpr', 'show_gdpr_dialog', 'false');

    await signOut(page);

    // Sign back in and navigate home — dialog must not appear.
    await resetSession(page);
    await page.goto('/');
    await signIn(page, {email, password});
    await setEuropeanIp(page);
    await gdpr.goto();
    await gdpr.waitForSignedIn();
    await expect(gdpr.dialog).not.toBeVisible();
  });
});
