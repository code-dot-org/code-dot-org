import {createTeacher, createTeacherAssociatedStudent} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

import {GlobalEditionFaPage} from './GlobalEditionFaPage';

test.describe('Global Edition Farsi MVP pages', () => {
  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_in_page.feature
   * Scenario: I see the Farsi MVP Sign In page
   */
  test('Farsi sign-in page shows localized main content', async ({page}) => {
    const fa = new GlobalEditionFaPage(page);
    await fa.gotoSignedOutFa('/users/sign_in');

    await expect(
      page.getByRole('heading', {
        name: 'دارای حساب کاربری هستید؟ وارد سیستم شوید',
      }),
    ).toBeVisible({timeout: 30_000});
    await expect(page.locator("form[action='/fa/join'] button")).toContainText(
      /Go/,
    );
    await expect(
      page.locator("form[action='/fa/users/auth/google_oauth2'] button"),
    ).toContainText(/ورود از طریق حساب گوگل/);
    await expect(
      page.locator("form[action='/fa/users/auth/microsoft_v2_auth'] button"),
    ).toContainText(/ورود از طریق حساب مایکروسافت/);
    await expect(
      page.locator("form[action='/fa/users/auth/facebook'] button"),
    ).toContainText(/ورود از طریق فیس‌بوک|ورود از طریق حساب فیس‌بوک/);
    await expect(
      page.locator("form[action='/fa/users/sign_in'] button"),
    ).toContainText(/ورود/);
    await expect(page.locator('#signin')).toContainText(
      'رمز عبور خود را فراموش کرده‌اید؟',
    );
    await expect(
      page.locator('#signin a', {hasText: 'یک حساب'}),
    ).toHaveAttribute('href', /\/fa\/users\/sign_up\/account_type/);
    await expect(page.locator('#code_without_signing_in')).toContainText(
      'می‌خواهید برنامه‌نویسی را بدون ثبت نام امتحان کنید؟',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/sign_up_page.feature
   * Scenario: I see the Farsi MVP Sign In page
   */
  test('Farsi sign-up page shows student and teacher account cards', async ({
    page,
  }) => {
    const fa = new GlobalEditionFaPage(page);
    await fa.gotoSignedOutFa('/users/sign_up/account_type');

    await expect(
      page.getByRole('heading', {
        name: 'حساب کاربری رایگان خود را ایجاد کنید',
      }),
    ).toBeVisible({timeout: 30_000});
    await expect(page.locator("[data-testid='student-card']")).toContainText(
      'من یک دانش‌آموز هستم',
    );
    await expect(page.locator("[data-testid='student-card']")).toContainText(
      'به عنوان یک دانش‌آموز ثبت نام کنید',
    );
    await expect(page.locator("[data-testid='teacher-card']")).toContainText(
      'من یک معلم هستم',
    );
    await expect(page.locator("[data-testid='teacher-card']")).toContainText(
      'به عنوان یک معلم ثبت نام کنید',
    );
    await expect(page.locator('.fa-book-open-cover + h2')).toContainText(
      'برنامه درسی رایگان. همیشه.',
    );
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/signed_out.feature
   * Scenario: Signed out user should see the correct header links on Dashboard
   */
  test('signed-out Farsi page shows localized dashboard header links', async ({
    page,
  }) => {
    await page.goto('/reset_session');
    const fa = new GlobalEditionFaPage(page);
    await fa.gotoFa('/fa/users/sign_in?lang=fa-IR');

    await expect(page.locator('.headerlinks')).toBeVisible({timeout: 30_000});
    for (const selector of [
      '#header-teach',
      '#header-about',
      '#header-csf',
      '#header-videos',
      '#header-hoa',
    ]) {
      await expect(page.locator(selector)).toBeVisible();
      await expect(page.locator(selector)).not.toHaveText('');
    }
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/personal_project_gallery.feature
   * Scenario: The student sees only the projects available in Farsi MVP
   */
  test('Farsi personal project gallery exposes only Farsi MVP project types', async ({
    page,
  }) => {
    await createTeacherAssociatedStudent(page, {studentName: 'Lillian'});
    const fa = new GlobalEditionFaPage(page);
    await fa.gotoFa('/fa/projects');
    await fa.expectFarsiDocument();

    await expect(page.locator('h4.new-project-heading')).toBeVisible({
      timeout: 30_000,
    });
    for (const [label, href] of [
      ['لابراتوار اسپرایت', '/projects/spritelab/new'],
      ['هنرمند', '/projects/artist/new'],
      ['لابراتوار اپ', '/projects/applab/new'],
      ['لابراتوار بازی', '/projects/gamelab/new'],
    ] as const) {
      await expect(
        page.getByRole('link', {name: label}).first(),
      ).toHaveAttribute('href', href);
    }

    await page.locator('#uitest-view-full-list').click();
    await expect(page.locator('#full-list-projects')).toBeVisible();
    await expect(
      page.locator("a[href='/projects/dance/new']"),
    ).not.toBeVisible();
    await expect(
      page.locator("a[href='/projects/playlab/new']"),
    ).not.toBeVisible();
    await expect(
      page.locator("a[href='/projects/weblab/new']"),
    ).not.toBeVisible();
  });

  /**
   * Migration status: COMPLETED
   * Source: dashboard/test/ui/features/platform/global_edition/fa/teacher_dashboard.feature
   * Scenario: Teacher does not see Teacher Promotion right panel
   */
  test('Farsi teacher dashboard hides the teacher promotion panel', async ({
    page,
  }) => {
    await createTeacher(page, {name: 'New Teacher'});
    await page.goto('/teacher_dashboard/home');
    await expect(page.locator('#teacher-home-header')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#ui-test-teacher-promotions')).toBeVisible();

    const fa = new GlobalEditionFaPage(page);
    await fa.gotoFa('/teacher_dashboard/home');
    await expect(page).toHaveURL(/\/fa\/teacher_dashboard\/home/);
    await expect(page.locator('#teacher-home-header')).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.locator('#ui-test-teacher-promotions')).not.toBeVisible();
  });
});
