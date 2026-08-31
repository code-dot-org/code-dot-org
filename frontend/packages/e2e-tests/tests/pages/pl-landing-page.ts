import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../shared/routes';

import {BasePage} from './base-page';

const SELF_PACED_COURSE = 'alltheselfpacedplthings';

/** Id suffix of a permission-gated tab button on the #myPLTabs strip. */
export type PlTabId =
  | 'myFacilitatorCenter'
  | 'instructorCenter'
  | 'RPCenter'
  | 'workshopOrganizerCenter';

/** Page object for the Professional Learning landing page (/my-professional-learning). */
export class PlLandingPage extends BasePage {
  /** The page's H1 ("Professional Learning" / translated equivalent). */
  readonly heading: Locator;

  /** Root container for the whole landing page, scoped for readiness/visual waits. */
  readonly container: Locator;

  /** "Join section" button — disabled until a section code is entered. */
  readonly joinSectionButton: Locator;

  /**
   * "Getting started with Professional Learning" banner link — absent
   * entirely in the fa region (hideMyPLBanner in config/global_editions/fa.yml).
   * href-matched rather than text-matched: the Cucumber contract itself
   * specifies this element by its link destination, and href survives across
   * locales where the link text does not.
   */
  readonly learnAboutProfessionalLearningLink: Locator;

  /**
   * "Learn more about workshops" recommendation link — absent entirely in the
   * fa region (hideMyPLStaticRecommendedPLMidHighBlock). href-matched for the
   * same reason as learnAboutProfessionalLearningLink.
   */
  readonly workshopsLink: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.locator('#pl-landing-page-container');
    this.heading = page.getByRole('heading', {level: 1});
    this.joinSectionButton = page.locator('button.ui-test-join-section');
    this.learnAboutProfessionalLearningLink = page.locator(
      "a[href*='/educate/professional-learning']",
    );
    this.workshopsLink = page.locator(
      "a[href*='/professional-learning/workshops']",
    );
  }

  /** Navigate to /my-professional-learning, optionally within a Global Edition region. */
  async goto({globalRegion}: {globalRegion?: string} = {}): Promise<void> {
    await super.goto({path: '/my-professional-learning', globalRegion});
    await expect(this.heading).toBeVisible();
  }

  /**
   * The composite "I visit Farsi version of Professional Learning Lending
   * page" step: land on the root-region page, then switch to fa and confirm
   * the translated heading rendered.
   */
  async gotoFarsi(): Promise<void> {
    await this.goto();
    await this.switchToGlobalEditionRegion('fa');
    await expect(this.heading).toContainText('یادگیری پیشرفته');
  }

  /** A permission-gated tab button on the tab strip, by its stable id suffix. */
  tab(id: PlTabId): Locator {
    return this.page.locator(`button#myPLTabs-tab-${id}`);
  }

  /**
   * The "Start professional learning courses" link, by its locale-specific
   * visible text (mirrors SignInPage.quickStartLink's id-vs-text tradeoff:
   * this link has no id, so the locale text is the only stable handle).
   */
  startCoursesLink(text: string): Locator {
    return this.page.getByRole('link', {name: text});
  }

  /** The "Continue course" self-paced-progress link, by its locale-specific visible text. */
  continueCourseLink(text: string): Locator {
    return this.page.getByRole('link', {name: text});
  }

  /**
   * Advance the "All the Self Paced PL Things" course into an in-progress
   * state, mirroring pd.rb's "I start a self-paced PL course" step: land on
   * lesson 1 level 3 (a free-response check-for-understanding) and submit it,
   * which lands on level 4. That is enough progress for the landing page's
   * self-paced-courses table to render a "Continue course" row.
   */
  async startSelfPacedCourse(): Promise<void> {
    await this.page.goto(
      labLevelUrl({course: SELF_PACED_COURSE, lesson: 1, level: 3}),
    );
    await this.page.locator('button.submitButton').click();
    await expect(this.page).toHaveURL(/\/levels\/4(\?|$)/);
  }
}
