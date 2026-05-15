import {expect, type Page} from '@playwright/test';

/**
 * Page object for common teacher-dashboard navigation and readiness checks.
 */
export class TeacherDashboardPage {
  private readonly page: Page;

  /**
   * @param page - current Playwright page
   */
  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Opens the teacher home page and waits for the section list.
   */
  async gotoHome(): Promise<void> {
    await this.page.goto('/teacher_dashboard/home');
    await expect(this.page.locator('#ui-test-section-list')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the first visible section's progress page.
   */
  async openFirstSectionProgress(): Promise<void> {
    await this.page
      .locator('a')
      .filter({hasText: 'View progress'})
      .first()
      .click();
    await expect(this.page.locator('#ui-test-teacher-sidebar')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens progress for a section by its task button id suffix.
   *
   * @param sectionName - visible section name encoded in the button id
   */
  async openSectionProgress(sectionName: string): Promise<void> {
    await this.page
      .locator(`#task-button-View-progress-${sectionName}`)
      .click();
    await expect(this.page.locator('#ui-test-teacher-sidebar')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Opens the sidebar tab with the given accessible link text.
   *
   * @param name - sidebar link name
   */
  async openSidebarTab(name: string): Promise<void> {
    await this.page
      .locator('#ui-test-teacher-sidebar')
      .getByRole('link', {name})
      .click();
  }

  /**
   * Waits for the Assessments tab selectors.
   */
  async expectAssessmentsTabReady(): Promise<void> {
    await expect(this.page.locator('#unit-selector-v2')).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('#assessment-selector')).toBeVisible({
      timeout: 30_000,
    });
  }

  /**
   * Verifies the dashboard has no section-level CAP warning banner.
   */
  async expectNoAgeGatedSectionsBanner(): Promise<void> {
    await expect(
      this.page.locator('#uitest-age-gated-sections-banner'),
    ).not.toBeVisible();
  }

  /**
   * Verifies the section progress page has no student-level CAP warning banner.
   */
  async expectNoAgeGatedStudentsBanner(): Promise<void> {
    await expect(
      this.page.locator('#uitest-age-gated-banner'),
    ).not.toBeVisible();
  }
}
