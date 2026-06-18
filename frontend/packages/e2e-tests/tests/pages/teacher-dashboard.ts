import {expect, type Locator, type Page} from '@playwright/test';

import {BasePage} from './base-page';

/** Page object for the teacher dashboard home (/teacher_dashboard/home). */
export class TeacherDashboardPage extends BasePage {
  /** Primary header rendered server-side; present in all regions. */
  readonly homeHeader: Locator;

  /** Promotions right-panel; absent in the FA Global Edition region. */
  readonly promotionsPanel: Locator;

  constructor(page: Page) {
    super(page);
    this.homeHeader = page.locator('#teacher-home-header');
    this.promotionsPanel = page.locator('#ui-test-teacher-promotions');
  }

  /** Navigate to /teacher_dashboard/home and wait for the header. */
  async goto(): Promise<void> {
    await this.page.goto('/teacher_dashboard/home');
    await expect(this.homeHeader).toBeVisible();
  }
}
