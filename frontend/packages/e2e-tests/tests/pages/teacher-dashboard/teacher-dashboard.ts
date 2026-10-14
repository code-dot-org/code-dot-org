import {expect, type Locator, type Page} from '@playwright/test';

import {DemoSectionCardComponent} from '../../components/demo-section-card';
import {LogoTransitionComponent} from '../../components/logo-transition';
import {BasePage} from '../base-page';

/** Page object for the teacher dashboard home (/teacher_dashboard/home). */
export class TeacherDashboardPage extends BasePage {
  /** Primary header rendered server-side; present in all regions. */
  readonly homeHeader: Locator;

  /** Promotions right-panel; absent in the FA Global Edition region. */
  readonly promotionsPanel: Locator;

  /** Practice-section card; only rendered for teachers with zero sections. */
  readonly demoSectionCard: DemoSectionCardComponent;

  /** First-run logo animation; owns the header logo until it settles. */
  readonly logoTransition: LogoTransitionComponent;

  /**
   * The teacher's own list of class-section cards. Renders a "Loading..."
   * skeleton at domcontentloaded, then swaps in the real cards (see
   * apps/src/templates/studioHomepages/teacherHomepageV2/SectionList.tsx).
   */
  readonly sectionList: Locator;

  /**
   * CAP age-gated-sections banner. The id below is what
   * age_gated_sections_modal.feature names, but no component in the app
   * renders it: commit 5e6ee3706786 (PR #71206) deleted
   * AgeGatedSectionsBanner/-Modal/-Table wholesale, and this id never matched
   * even before that removal (a separate, still-live component,
   * AgeGatedStudentsBanner, uses id `uitest-age-gated-banner` and lives
   * outside this route). This locator can never resolve to a visible
   * element; asserting it hidden is a faithful but permanently-true port of
   * the Cucumber step, not a live check of a still-existing surface.
   */
  readonly ageGatedSectionsBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.homeHeader = page.locator('#teacher-home-header');
    this.promotionsPanel = page.locator('#ui-test-teacher-promotions');
    this.demoSectionCard = new DemoSectionCardComponent(page);
    this.logoTransition = new LogoTransitionComponent(page);
    this.sectionList = page.locator('#ui-test-section-list');
    this.ageGatedSectionsBanner = page.locator(
      '#uitest-age-gated-sections-banner',
    );
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
