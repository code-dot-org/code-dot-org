import {expect, type Page} from '@playwright/test';

const REPORT_ABUSE_URL = '/report_abuse';

/**
 * Page object for the dashboard report-abuse form.
 */
export class ReportAbusePage {
  private readonly page: Page;

  /**
   * @param page - Playwright page under test
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the report-abuse form and wait for the user-visible form
   * heading and submit button. These are the readiness signal for this page.
   */
  async goto(): Promise<void> {
    await this.page.goto(REPORT_ABUSE_URL, {waitUntil: 'domcontentloaded'});
    await expect(
      this.page.getByRole('heading', {name: 'Report Abuse'}),
    ).toBeVisible();
    await expect(this.page.getByRole('button', {name: 'Submit'})).toBeVisible();
  }

  /**
   * Fill fields required when no user identity is known.
   */
  async fillSignedOutReport(): Promise<void> {
    await this.page.getByLabel('Email').fill('harry@hogwarts.edu');
    await this.page.locator('#uitest-age-selector').selectOption('13');
    await this.fillCommonReportFields();
  }

  /**
   * Assert that a signed-in student's age is known, then fill the remaining
   * report fields.
   */
  async fillStudentReport(): Promise<void> {
    await expect(this.page.locator('#uitest-age-selector')).not.toBeVisible();
    await this.page.getByLabel('Email').fill('harry@hogwarts.edu');
    await this.fillCommonReportFields();
  }

  /**
   * Assert that a signed-in teacher's email and age are known, then fill the
   * remaining report fields.
   */
  async fillTeacherReport(): Promise<void> {
    await expect(this.page.getByLabel('Email')).not.toBeVisible();
    await expect(this.page.locator('#uitest-age-selector')).not.toBeVisible();
    await this.fillCommonReportFields();
  }

  /**
   * Fill fields that are common to all report-abuse auth contexts.
   */
  private async fillCommonReportFields(): Promise<void> {
    await this.page.getByLabel('Abuse types').selectOption('Other');
    await this.page
      .getByLabel(
        'Please provide as much detail as possible regarding the content you are reporting.',
      )
      .fill('Mudblood is an offensive term');
    await this.completeCaptcha();
  }

  /**
   * Fill the hidden CAPTCHA field with the test bypass token. This mirrors
   * the Cucumber `I complete the CAPTCHA` step without relying on jQuery.
   */
  private async completeCaptcha(): Promise<void> {
    await this.page
      .locator('#g-recaptcha-response')
      .waitFor({state: 'attached', timeout: 15_000});
    await this.page.evaluate(() => {
      const el = document.getElementById(
        'g-recaptcha-response',
      ) as HTMLInputElement | null;
      if (el) {
        el.value = 'test-captcha-response';
        el.dispatchEvent(new Event('input', {bubbles: true}));
        el.dispatchEvent(new Event('change', {bubbles: true}));
      }
    });
  }

  /**
   * Submit the abuse report and wait for the external support redirect.
   */
  async submitAndExpectSupportRedirect(): Promise<void> {
    await Promise.all([
      this.page.waitForURL(/support\.code\.org/, {
        timeout: 60_000,
        waitUntil: 'domcontentloaded',
      }),
      this.page.getByRole('button', {name: 'Submit'}).click(),
    ]);
  }
}
