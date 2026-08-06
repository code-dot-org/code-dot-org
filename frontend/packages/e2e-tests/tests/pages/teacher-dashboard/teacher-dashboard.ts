import {expect, type Locator, type Page} from '@playwright/test';

import {DemoSectionCardComponent} from '../../components/demo-section-card';
import {BasePage} from '../base-page';

/** Page object for the teacher dashboard home (/teacher_dashboard/home). */
export class TeacherDashboardPage extends BasePage {
  /** Primary header rendered server-side; present in all regions. */
  readonly homeHeader: Locator;

  /** Promotions right-panel; absent in the FA Global Edition region. */
  readonly promotionsPanel: Locator;

  /** Practice-section card; only rendered for teachers with zero sections. */
  readonly demoSectionCard: DemoSectionCardComponent;

  constructor(page: Page) {
    super(page);
    this.homeHeader = page.locator('#teacher-home-header');
    this.promotionsPanel = page.locator('#ui-test-teacher-promotions');
    this.demoSectionCard = new DemoSectionCardComponent(page);
  }

  /** Navigate to /teacher_dashboard/home, optionally enabling an experiment. */
  async goto({
    experiment,
    globalRegion,
  }: {experiment?: string; globalRegion?: string} = {}): Promise<void> {
    const query = experiment
      ? `?${new URLSearchParams({enableExperiments: experiment})}`
      : '';
    await super.goto({path: `/teacher_dashboard/home${query}`, globalRegion});
    await expect(this.homeHeader).toBeVisible();
  }

  async navigateToRoster(): Promise<void> {
    await this.goto();
    const dropdownTrigger = this.page.getByRole('button', {
      name: 'Section options dropdown',
    });
    await expect(dropdownTrigger).toBeVisible();
    await dropdownTrigger.click();
    await this.page.getByRole('link', {name: 'Roster'}).click();
  }
}
