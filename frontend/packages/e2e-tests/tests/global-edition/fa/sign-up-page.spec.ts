import {expect, test} from '../../fixtures';
import {SignUpPage} from '../../pages/sign-up';
import {waitForVisualStability} from '../../shared/stability';

test.describe('Global Edition - Farsi MVP - Sign Up page', () => {
  test.skip(
    ({browserName}) => browserName !== 'chromium',
    'firefox/webkit hit a GE-redirect cookie race (ge_region cookie not applied on the 302 follow)',
  );

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_up_page.feature
   * Scenario: "I see the Farsi MVP Sign In page"
   */
  test('I see the Farsi MVP Sign Up page', async ({page}) => {
    const signUp = new SignUpPage(page);
    await signUp.goto({globalRegion: 'fa'});

    await expect(signUp.heading).toContainText(
      'حساب کاربری رایگان خود را ایجاد کنید',
    );
    // U+200C ZWNJ between the two words below is intentional Farsi orthography.
    await expect(signUp.studentCardHeading).toContainText(
      'من یک دانش‌آموز هستم',
    );
    await expect(signUp.studentCardButton).toContainText(
      'به عنوان یک دانش‌آموز ثبت نام کنید',
    );
    await expect(signUp.teacherCardHeading).toContainText('من یک معلم هستم');
    await expect(signUp.teacherCardButton).toContainText(
      'به عنوان یک معلم ثبت نام کنید',
    );

    await expect(signUp.freeCurriculumHeading).toContainText(
      'برنامه درسی رایگان. همیشه.',
    );
    await expect(signUp.readCommitmentButton).toContainText(
      'تعهد ما را به رایگان نگه داشتن برنامه های درسی برای همه بخوانید.',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_up_page.feature
   * Scenario: "I see the Farsi MVP Sign In page"
   */
  test(
    'I see the Farsi MVP Sign Up page — visual snapshot',
    {tag: ['@visual']},
    async ({page, visualCheck}) => {
      const signUp = new SignUpPage(page);
      await signUp.goto({globalRegion: 'fa'});
      await expect(signUp.heading).toBeVisible();

      await waitForVisualStability(page, signUp.mainContent);
      await visualCheck('Main content', {
        region: signUp.mainContent,
      });
    },
  );
});
