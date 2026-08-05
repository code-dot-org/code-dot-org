import {expect, test} from '../../fixtures';
import {SignInPage} from '../../pages/sign-in';
import {waitForVisualStability} from '../../shared/stability';

test.describe('Global Edition - Farsi MVP - Sign In page', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'firefox/webkit hit a GE-redirect cookie race (ge_region cookie not applied on the 302 follow)',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_in_page.feature
   * Scenario: I see the Farsi MVP Sign In page
   */
  test('I see the Farsi MVP Sign In page', async ({page}) => {
    const signIn = new SignInPage(page);
    await signIn.goto({globalRegion: 'fa'});

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

    await expect(signIn.codeWithoutSigningInHeading).toContainText(
      'می‌خواهید برنامه‌نویسی را بدون ثبت نام امتحان کنید؟',
    );
    await expect(signIn.quickStartLink('مهمانی رقص')).toHaveAttribute(
      'href',
      /\/dance/,
    );
    await expect(signIn.quickStartLink('ماین‌کرفت')).toHaveAttribute(
      'href',
      /\/api\/hour\/begin\/mc/,
    );
    await expect(signIn.quickStartLink('فروزن')).toHaveAttribute(
      'href',
      /\/s\/frozen\/reset/,
    );
    await expect(signIn.quickStartLink('ماز معروف و قدیمی')).toHaveAttribute(
      'href',
      /\/s\/hourofcode\/reset/,
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_in_page.feature
   * Scenario: I see the Farsi MVP Sign In page
   */
  test(
    'I see the Farsi MVP Sign In page — visual snapshot',
    {tag: ['@visual']},
    async ({page, visualCheck}) => {
      const signIn = new SignInPage(page);
      await signIn.goto({globalRegion: 'fa'});
      await expect(signIn.heading).toBeVisible();

      await waitForVisualStability(page, signIn.mainContent);
      await visualCheck('fa-sign-in-page-main-content', {
        region: signIn.mainContent,
      });
    },
  );
});
