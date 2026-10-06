import {OneTrustComponent} from '../components/one-trust';
import {expect, test} from '../fixtures';
import {SignInPage} from '../pages/sign-in';
import {createStudent, signOut, waitForHomeUrl} from '../shared/auth';
import {setCookie} from '../shared/cookies';
import {
  deleteStableIdCookie,
  fetchStableId,
  STABLE_ID_FORMAT,
  STATSIG_STABLE_ID_COOKIE,
  stableIdCookie,
} from '../shared/statsig';

const FORCED_STABLE_ID = '8f819c93-3aa9-4c2f-9bea-8d32a448f368';

test.describe('Statsig stable ID', {tag: ['@no_mobile', '@chrome']}, () => {
  test.beforeEach(() => {
    test.skip(
      test.info().project.name !== 'chromium',
      'chromium-only (@chrome feature)',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/statsig_stable_id.feature
   * "The stable ID persists through consent changes and cookie recovery"
   */
  test('The stable ID persists through consent changes and cookie recovery', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    // The server binds an ID to the session but does not set the cookie.
    let stableId = await fetchStableId(page);
    expect(stableId).toMatch(STABLE_ID_FORMAT);
    expect(await stableIdCookie(page)).toBeUndefined();

    expect(await fetchStableId(page)).toBe(stableId);
    expect(await stableIdCookie(page)).toBeUndefined();

    // Without performance consent the client must not write the cookie.
    await oneTrust.openPreferenceCenter('/users/sign_in', {geo: 'es'});
    await oneTrust.savePerformanceConsent(false);
    await page.reload();
    await expect
      .poll(() => oneTrust.activeGroups())
      .toEqual(expect.arrayContaining(['C0001']));
    expect(await oneTrust.activeGroups()).not.toContain('C0002');
    expect(await stableIdCookie(page)).toBeUndefined();

    // With consent, the client adopts the server's ID rather than minting one.
    await oneTrust.openPreferenceCenter('/users/sign_in', {geo: 'es'});
    await oneTrust.savePerformanceConsent(true);
    await page.reload();
    await expect
      .poll(() => oneTrust.activeGroups())
      .toEqual(expect.arrayContaining(['C0001', 'C0002']));
    await expect.poll(() => stableIdCookie(page)).toBe(stableId);

    // A lost cookie is recovered from the session.
    await deleteStableIdCookie(page);
    expect(await stableIdCookie(page)).toBeUndefined();
    await page.reload();
    await expect
      .poll(() => oneTrust.activeGroups())
      .toEqual(expect.arrayContaining(['C0001', 'C0002']));
    await expect.poll(() => stableIdCookie(page)).toBe(stableId);

    // An existing cookie wins over the session and becomes the session's ID.
    await setCookie(page, STATSIG_STABLE_ID_COOKIE, FORCED_STABLE_ID);
    expect(await stableIdCookie(page)).not.toBe(stableId);
    stableId = await fetchStableId(page);
    expect(stableId).toBe(FORCED_STABLE_ID);
    await page.goto('/users/sign_in');
    await expect.poll(() => stableIdCookie(page)).toBe(stableId);
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/statsig_stable_id.feature
   * "The stable ID persists through sign-in and changes after sign-out"
   */
  test('The stable ID persists through sign-in and changes after sign-out', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);
    const signInPage = new SignInPage(page);

    await page.goto('/');
    const student1 = await createStudent(page, {name: 'Student1'});
    const student2 = await createStudent(page, {name: 'Student2'});
    await signOut(page);

    const stableId = await fetchStableId(page);
    expect(stableId).toMatch(STABLE_ID_FORMAT);
    expect(await stableIdCookie(page)).toBeUndefined();

    await oneTrust.openPreferenceCenter('/users/sign_in', {geo: 'es'});
    await oneTrust.savePerformanceConsent(true);
    await page.reload();
    await expect.poll(() => stableIdCookie(page)).toBe(stableId);

    // Signing in keeps the anonymous ID.
    await signInPage.waitForForm();
    await signInPage.fillCredentials(student1);
    await signInPage.submit();
    await waitForHomeUrl(page, 'student');
    await expect(signInPage.header.displayName).toContainText('Student1');
    await expect.poll(() => stableIdCookie(page)).toBe(stableId);

    // Signing out drops it.
    await signOut(page);
    expect(await stableIdCookie(page)).toBeUndefined();

    // The next user gets a fresh one.
    await signInPage.goto();
    await signInPage.waitForForm();
    await signInPage.fillCredentials(student2);
    await signInPage.submit();
    await waitForHomeUrl(page, 'student');
    await expect(signInPage.header.displayName).toContainText('Student2');
    await expect.poll(() => stableIdCookie(page)).toMatch(STABLE_ID_FORMAT);
    expect(await stableIdCookie(page)).not.toBe(stableId);
  });
});
