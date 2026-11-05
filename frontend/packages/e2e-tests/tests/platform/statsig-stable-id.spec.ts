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
   * "The stable ID is stored only in the cookie, and only with consent"
   */
  test('The stable ID is stored only in the cookie, and only with consent', async ({
    page,
  }) => {
    const oneTrust = new OneTrustComponent(page);

    // Without a cookie the server returns a fresh ID each time and saves none.
    const firstStableId = await fetchStableId(page);
    const secondStableId = await fetchStableId(page);
    expect(firstStableId).toMatch(STABLE_ID_FORMAT);
    expect(secondStableId).toMatch(STABLE_ID_FORMAT);
    expect(secondStableId).not.toBe(firstStableId);
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

    // With consent, the sign-in page stores a third, new ID in the cookie.
    await oneTrust.openPreferenceCenter('/users/sign_in', {geo: 'es'});
    await oneTrust.savePerformanceConsent(true);
    await page.reload();
    await expect
      .poll(() => oneTrust.activeGroups())
      .toEqual(expect.arrayContaining(['C0001', 'C0002']));
    await expect.poll(() => stableIdCookie(page)).toMatch(STABLE_ID_FORMAT);
    const stableId = await stableIdCookie(page);
    expect(stableId).not.toBe(firstStableId);
    expect(stableId).not.toBe(secondStableId);
    expect(await fetchStableId(page)).toBe(stableId);

    // The session holds no copy, so a lost cookie is replaced with a new ID.
    await deleteStableIdCookie(page);
    expect(await stableIdCookie(page)).toBeUndefined();
    await page.goto('/users/sign_in');
    await expect
      .poll(() => oneTrust.activeGroups())
      .toEqual(expect.arrayContaining(['C0001', 'C0002']));
    await expect.poll(() => stableIdCookie(page)).toMatch(STABLE_ID_FORMAT);
    expect(await stableIdCookie(page)).not.toBe(stableId);

    // An existing cookie wins and is kept.
    await setCookie(page, STATSIG_STABLE_ID_COOKIE, FORCED_STABLE_ID);
    expect(await fetchStableId(page)).toBe(FORCED_STABLE_ID);
    await page.goto('/users/sign_in');
    await expect.poll(() => stableIdCookie(page)).toBe(FORCED_STABLE_ID);
  });

  /**
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

    expect(await fetchStableId(page)).toMatch(STABLE_ID_FORMAT);
    expect(await stableIdCookie(page)).toBeUndefined();

    await oneTrust.openPreferenceCenter('/users/sign_in', {geo: 'es'});
    await oneTrust.savePerformanceConsent(true);
    await page.reload();
    await expect.poll(() => stableIdCookie(page)).toMatch(STABLE_ID_FORMAT);
    const stableId = await stableIdCookie(page);

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
