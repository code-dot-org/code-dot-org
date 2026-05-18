import {expect, type Locator, type Page} from '@playwright/test';

/**
 * Page object for the Professional Learning landing page.
 */
export class ProfessionalLearningPage {
  /** Underlying Playwright page. */
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the Professional Learning page and waits for its main heading.
   *
   * @param farsi - whether to request the Farsi Global Edition page
   */
  async goto({farsi = false}: {farsi?: boolean} = {}): Promise<void> {
    await this.page.goto(
      `/my-professional-learning${farsi ? '?ge_region=fa' : ''}`,
    );
    await expect(this.page.locator('h1')).toBeVisible({timeout: 30_000});
  }

  /**
   * Returns a Professional Learning tab by its accessible label.
   *
   * @param name - visible tab label
   */
  tab(name: string): Locator {
    return this.page.getByRole('tab', {name});
  }

  /**
   * Opens a Professional Learning tab and waits for the selected state.
   *
   * @param name - visible tab label
   */
  async openTab(name: string): Promise<void> {
    const tab = this.tab(name);
    await tab.click();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Asserts shared staff-center resources and the workshops table row.
   */
  async expectWorkshopCenterContent(): Promise<void> {
    await expect(
      this.page.getByRole('link', {name: 'View workshop dashboard'}),
    ).toHaveAttribute('href', /\/pd\/workshop_dashboard/);
    await expect(
      this.page.getByRole('button', {name: 'Workshop Details'}),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Asserts the regional-partner center resource links.
   */
  async expectRegionalPartnerResources(): Promise<void> {
    await expect(
      this.page.getByRole('link', {name: 'View workshop dashboard'}),
    ).toHaveAttribute('href', /\/pd\/workshop_dashboard/);
    await expect(
      this.page.getByRole('link', {name: 'View playbook'}),
    ).toHaveAttribute(
      'href',
      /\/professional-learning\/regional-partner\/playbook/,
    );
  }

  /**
   * Starts the self-paced PL course used by the source Cucumber scenario.
   */
  async startSelfPacedCourse(): Promise<void> {
    await this.page.goto(
      '/courses/alltheselfpacedplthings/units/1/lessons/1/levels/1',
    );
    await this.page
      .locator("a[title='Level 3 Lesson Instructor In Training Levels']")
      .waitFor({state: 'visible', timeout: 30_000});
    await this.page
      .locator("a[title='Level 3 Lesson Instructor In Training Levels']")
      .click();
    await expect(this.page).toHaveURL(/\/levels\/3/, {timeout: 30_000});
    await this.page.getByRole('button', {name: 'Submit'}).click();
    await expect(this.page).toHaveURL(/\/levels\/4/, {timeout: 30_000});
    await expect(
      this.page.getByRole('button', {name: 'Submit'}).first(),
    ).toBeVisible({timeout: 30_000});
  }

  /**
   * Asserts the default English new-teacher PL content.
   */
  async expectEnglishNewTeacherContent(): Promise<void> {
    await expect(
      this.page.getByRole('link', {name: 'Learn about professional learning'}),
    ).toHaveAttribute('href', /\/educate\/professional-learning/);
    await expect(
      this.page.locator('button.ui-test-join-section'),
    ).toBeVisible();
    await expect(
      this.page.getByRole('link', {name: 'Learn more about workshops'}),
    ).toHaveAttribute('href', /\/professional-learning\/workshops/);
    await expect(
      this.page.getByRole('link', {
        name: 'Start professional learning courses',
      }),
    ).toHaveAttribute('href', /\/educate\/professional-development-online/);
  }

  /**
   * Asserts the reduced Farsi PL landing content.
   */
  async expectFarsiLandingContent(): Promise<void> {
    await expect(this.page).toHaveURL(/\/fa\/my-professional-learning/);
    await expect(this.page.locator('h1')).toContainText('یادگیری پیشرفته');
    await expect(
      this.page.locator("a[href*='/educate/professional-learning']"),
    ).not.toBeVisible();
    await expect(
      this.page.locator('button.ui-test-join-section'),
    ).not.toBeVisible();
    await expect(
      this.page.locator("a[href*='/professional-learning/workshops']"),
    ).not.toBeVisible();
    await expect(
      this.page.getByRole('link', {
        name: /دوره‌های آموزش حرفه‌ای را شروع کنید/,
      }),
    ).toHaveAttribute('href', /\/fa\/teacher/);
  }
}
