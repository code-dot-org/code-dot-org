import {createStudent, createTeacher} from '../../shared/auth';
import {expect, test} from '../../shared/fixtures';

/**
 * Report abuse form — /report_abuse, three auth contexts.
 *
 * Source:
 *   dashboard/test/ui/features/teacher_tools/report_abuse.feature
 *
 * CAPTCHA bypass: the test environment accepts the literal token
 * "test-captcha-response" in the hidden #g-recaptcha-response field,
 * matching the Cucumber step `I complete the CAPTCHA`.
 */

const REPORT_ABUSE_URL = '/report_abuse';

/**
 * Fill the CAPTCHA hidden field with the test bypass token.
 * Mirrors `I complete the CAPTCHA` from steps.rb.
 *
 * @param page - Playwright page with the report abuse form loaded
 */
async function completeCaptcha(
  page: import('@playwright/test').Page,
): Promise<void> {
  await page.evaluate(() => {
    const el = document.getElementById(
      'g-recaptcha-response',
    ) as HTMLInputElement | null;
    if (el) el.value = 'test-captcha-response';
  });
}

test.describe('Report abuse form', () => {
  test('signed-out user: form accepts email, age, type, detail, and submits', async ({
    page,
  }) => {
    await page.goto(REPORT_ABUSE_URL);
    await page
      .locator('#uitest-email')
      .waitFor({state: 'visible', timeout: 30_000});

    await page.locator('#uitest-email').fill('harry@hogwarts.edu');
    await page.locator('#uitest-age-selector').selectOption('13');
    await page.locator('#uitest-abuse-type').selectOption('Other');
    await page
      .locator('#uitest-abuse-detail')
      .fill('Mudblood is an offensive term');
    await completeCaptcha(page);

    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#uitest-submit-report-abuse').click(),
    ]);
    expect(page.url()).toContain('support.code.org');
  });

  test('signed-in student: age selector hidden; email pre-filled; submits', async ({
    page,
  }) => {
    await createStudent(page);
    await page.goto(REPORT_ABUSE_URL);
    await page
      .locator('#uitest-email')
      .waitFor({state: 'visible', timeout: 30_000});

    // Age is known — selector not shown.
    await expect(page.locator('#uitest-age-selector')).not.toBeVisible();

    await page.locator('#uitest-email').fill('harry@hogwarts.edu');
    await page.locator('#uitest-abuse-type').selectOption('Other');
    await page
      .locator('#uitest-abuse-detail')
      .fill('Mudblood is an offensive term');
    await completeCaptcha(page);

    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#uitest-submit-report-abuse').click(),
    ]);
    expect(page.url()).toContain('support.code.org');
  });

  test('signed-in teacher: email and age hidden; submits', async ({page}) => {
    await createTeacher(page);
    await page.goto(REPORT_ABUSE_URL);
    // Email and age are known from the account — both inputs hidden.
    await page
      .locator('#uitest-abuse-type')
      .waitFor({state: 'visible', timeout: 30_000});

    await expect(page.locator('#uitest-email')).not.toBeVisible();
    await expect(page.locator('#uitest-age-selector')).not.toBeVisible();

    await page.locator('#uitest-abuse-type').selectOption('Other');
    await page
      .locator('#uitest-abuse-detail')
      .fill('Mudblood is an offensive term');
    await completeCaptcha(page);

    await Promise.all([
      page.waitForNavigation({timeout: 30_000}),
      page.locator('#uitest-submit-report-abuse').click(),
    ]);
    expect(page.url()).toContain('support.code.org');
  });
});
