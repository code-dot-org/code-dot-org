import {expect, test} from '../fixtures';
import {SignInPage} from '../pages/sign-in';
import {
  createEuStudent,
  createTeacherAssociatedStudent,
  signOut,
  waitForHomeUrl,
} from '../shared/auth';

test.describe('Signing in', () => {
  test('Student sign in from studio.code.org', async ({
    page,
    signInAsNewUser,
  }) => {
    const signIn = new SignInPage(page);

    // Seed a signed-in student, then sign out to start from a clean state.
    const {email, password, name} = await signInAsNewUser({
      type: 'student',
      name: 'Alice',
    });
    await signOut(page);

    await signIn.goto();
    await signIn.waitForForm();
    await signIn.fillCredentials({email, password});
    await signIn.submit();

    await waitForHomeUrl(page, 'student');
    await expect(signIn.header.userMenu).toBeVisible();
    await expect(signIn.header.displayName).toBeVisible();
    await expect(signIn.header.displayName).toContainText(name);
  });

  test('Student sign in from studio.code.org in the eu', async ({page}) => {
    const signIn = new SignInPage(page);

    await page.goto('/');
    const {email, password, name} = await createEuStudent(page, {
      name: 'Alice',
    });
    await signOut(page);

    await signIn.goto();
    await signIn.waitForForm();
    await signIn.fillCredentials({email, password});
    await signIn.submit();

    await waitForHomeUrl(page, 'student');
    await expect(signIn.header.userMenu).toBeVisible();
    await expect(signIn.header.displayName).toBeVisible();
    await expect(signIn.header.displayName).toContainText(name);
  });

  test('Teacher sign in from studio.code.org', async ({
    page,
    signInAsNewUser,
  }) => {
    const signIn = new SignInPage(page);

    // Seed a signed-in teacher, then sign out to start from a clean state.
    const {email, password, name} = await signInAsNewUser({
      type: 'teacher',
      name: 'Casey',
    });
    await signOut(page);

    await signIn.goto();
    await signIn.waitForForm();
    await signIn.fillCredentials({email, password});
    await signIn.submit();

    await waitForHomeUrl(page, 'teacher');
    await expect(signIn.header.userMenu).toBeVisible();
    await expect(signIn.header.displayName).toBeVisible();
    await expect(signIn.header.displayName).toContainText(name);
  });

  test('Signed-out joining non-picture non-word section from sign in page goes to link account page', async ({
    page,
  }) => {
    const signIn = new SignInPage(page);

    // Seed: teacher, section, enrolled student (student session active on return).
    await page.goto('/');
    const {sectionCode} = await createTeacherAssociatedStudent(page, {
      studentName: `Student ${Math.floor(Math.random() * 100000)}`,
    });
    await signOut(page);

    await signIn.goto();
    await signIn.fillSectionCode(sectionCode);
    await signIn.submitSectionCode();

    // The logged_out page renders a "Create an account" link that may need
    // ~1000ms of React hydration in some locales; wait on the link itself, not
    // the page container.
    await expect(signIn.createAccountLink).toBeVisible();
  });
});
