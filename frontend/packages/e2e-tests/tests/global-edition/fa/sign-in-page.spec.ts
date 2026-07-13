import {expect, test} from '../../fixtures';
import {SignInPage} from '../../pages/sign-in';
import {waitForVisualStability} from '../../shared/stability';

test.describe('Global Edition - Farsi MVP - Sign In page', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'Source feature is @chrome-only; firefox/webkit hit a GE-redirect cookie race (ge_region cookie not applied on the 302 follow, so the server renders the root region instead of /fa)',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_in_page.feature
   * "I see the Farsi MVP Sign In page"
   *
   * Split into a content-assertions test and a @visual snapshot test. The
   * source scenario is entirely @eyes-gated, so porting it as a single test
   * would carry only the @visual tag; playwright.config.ts's grepInvert
   * (functional projects) then excludes 100% of this file's tests, and a
   * direct per-file invocation of the browser-matrix stress gate hits
   * "No tests found" instead of running (or cleanly skipping). Splitting
   * keeps the same assertions but gives the file a non-@visual test so it
   * always has content under chromium/firefox/webkit.
   */
  test('I see the Farsi MVP Sign In page', async ({page}) => {
    const signIn = new SignInPage(page);

    // Background: anonymous visit to root, then switch to the fa region.
    await page.goto('/');
    await signIn.switchToGlobalEditionRegion('fa');

    await page.goto('/fa/users/sign_in');

    // Have an account already? Sign in.
    await expect(signIn.heading).toContainText(
      'دارای حساب کاربری هستید؟ وارد سیستم شوید',
    );
    await expect(signIn.sectionSignInButton).toContainText('Go');
    await expect(signIn.googleSignInButton).toContainText(
      'ورود از طریق حساب گوگل',
    );
    await expect(signIn.microsoftSignInButton).toContainText(
      'ورود از طریق حساب مایکروسافت',
    );
    // U+200C ZWNJ between the two words below is intentional Farsi orthography.
    await expect(signIn.facebookSignInButton).toContainText(
      'ورود از طریق حساب فیس‌بوک',
    );
    await expect(signIn.cleverSignInButton).toContainText('ورود از طریق باهوش');
    await expect(signIn.signInButton).toContainText('ورود');

    await expect(
      signIn.linkInSignInForm('رمز عبور خود را فراموش کرده‌اید؟'),
    ).toHaveAttribute('href', '/fa/users/password/new');
    await expect(
      signIn.linkInSignInForm('یک حساب کاربری ایجاد کنید'),
    ).toHaveAttribute('href', /\/fa\/users\/sign_up\/account_type/);

    // Want to try coding without signing in?
    await expect(signIn.codeWithoutSigningInHeading).toContainText(
      'می‌خواهید برنامه‌نویسی را بدون ثبت نام امتحان کنید؟',
    );
    await expect(signIn.quickStartLink('مهمانی رقص')).toHaveAttribute(
      'href',
      /\/dance$/,
    );
    await expect(signIn.quickStartLink('ماین‌کرفت')).toHaveAttribute(
      'href',
      /\/api\/hour\/begin\/mc$/,
    );
    await expect(signIn.quickStartLink('فروزن')).toHaveAttribute(
      'href',
      /\/s\/frozen\/reset$/,
    );
    await expect(signIn.quickStartLink('ماز معروف و قدیمی')).toHaveAttribute(
      'href',
      /\/s\/hourofcode\/reset$/,
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_in_page.feature
   * "I see the Farsi MVP Sign In page" — the @eyes screenshot-diff portion.
   */
  test(
    'I see the Farsi MVP Sign In page — visual snapshot',
    {tag: ['@visual']},
    async ({page, visualCheck}) => {
      const signIn = new SignInPage(page);

      // Background: anonymous visit to root, then switch to the fa region.
      await page.goto('/');
      await signIn.switchToGlobalEditionRegion('fa');

      await page.goto('/fa/users/sign_in');
      await expect(signIn.heading).toBeVisible();

      await waitForVisualStability(page, signIn.mainContent);
      // The Ruby source scopes this check to #main_content via Eyes'
      // check_region (Target.region), which the shared playwright-support
      // visual package does not expose (window-only Target.window()). A
      // full-page capture is the closest approximation available without
      // touching that shared package; it additionally covers the header and
      // footer, which the original check excluded.
      await visualCheck('fa-sign-in-page-main-content');
    },
  );
});
