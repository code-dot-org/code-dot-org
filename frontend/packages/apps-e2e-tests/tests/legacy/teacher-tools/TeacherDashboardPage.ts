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
   * Waits for teacher-homepage section cards to finish async course-content
   * rendering before a visual checkpoint.
   */
  async expectHomepageVisualReady(): Promise<void> {
    await expect(this.page.locator('#ui-test-section-list')).toBeVisible({
      timeout: 30_000,
    });
    await expect(
      this.page.locator('#go-to-lesson-dropdown-button').first(),
    ).toBeEnabled({timeout: 30_000});
    await this.page.evaluate(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
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
   * Waits for the V2 progress page to finish rendering the visible table.
   */
  async expectProgressV2Ready(): Promise<void> {
    await expect(
      this.page.getByRole('heading', {name: 'Icon Key'}),
    ).toBeVisible({
      timeout: 30_000,
    });
    await expect(this.page.locator('#ui-test-progress-table-v2')).toBeVisible({
      timeout: 30_000,
    });
    await this.page.waitForSelector('#ui-test-skeleton-progress-column', {
      state: 'hidden',
      timeout: 60_000,
    });
  }

  /**
   * Opens a V2 progress lesson column by lesson position.
   *
   * @param lessonPosition - one-based lesson number in the table
   */
  async expandProgressLesson(lessonPosition: number): Promise<void> {
    const lessonHeader = this.page.locator(
      `#ui-test-lesson-header-${lessonPosition}`,
    );
    await lessonHeader.evaluate(element => {
      element.scrollIntoView({block: 'center', inline: 'center'});
    });
    await lessonHeader.click({force: true});
    await expect(
      this.page.locator(
        `#ui-test-expanded-progress-column-header-${lessonPosition}`,
      ),
    ).toBeVisible({timeout: 15_000});
  }

  /**
   * Closes a V2 progress lesson column by lesson position.
   *
   * @param lessonPosition - one-based lesson number in the table
   */
  async collapseProgressLesson(lessonPosition: number): Promise<void> {
    await this.page
      .locator(`#ui-test-expanded-progress-column-header-${lessonPosition}`)
      .click();
    await expect(
      this.page.locator(
        `#ui-test-expanded-progress-column-header-${lessonPosition}`,
      ),
    ).not.toBeAttached({timeout: 15_000});
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
   * Waits for a course overview page to render to its end. Full-page visual
   * screenshots otherwise can capture before the legend and footer mount.
   */
  async expectCourseOverviewVisualReady(): Promise<void> {
    await expect(
      this.page.getByRole('button', {name: 'Show All Lessons'}),
    ).toBeVisible({timeout: 30_000});
    await expect(
      this.page.getByRole('button', {name: 'Hide All Lessons'}),
    ).toBeVisible({timeout: 30_000});
    await expect(this.page.getByText('Lesson 55: Unplugged Level')).toBeVisible(
      {
        timeout: 30_000,
      },
    );
    await expect(this.page.getByRole('cell', {name: 'Level Type'})).toBeVisible(
      {timeout: 30_000},
    );
    await expect(
      this.page.getByRole('link', {name: 'Powered by AWS Cloud Computing'}),
    ).toBeVisible({timeout: 30_000});
    await this.page.evaluate(() => window.scrollTo(0, 0));
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
