import {type Locator, type Page} from '@playwright/test';

import {
  lessonOverviewUrl,
  type LessonOverviewUrlParams,
} from '../shared/routes';

import {BasePage} from './base-page';

/** The lesson overview (lesson plan) page for a single lesson. */
export class LessonOverviewPage extends BasePage {
  /**
   * The lesson's displayed title (unnumbered courses omit the "Lesson N"
   * prefix) — the page's sole <h1> (LessonOverview.jsx), addressed by its
   * implicit heading role rather than its ".uitest-lesson-title" hook class.
   */
  readonly lessonTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.lessonTitle = page.getByRole('heading', {level: 1});
  }

  /** Navigate to the lesson overview page. */
  async gotoOverview(params: LessonOverviewUrlParams): Promise<void> {
    await this.page.goto(lessonOverviewUrl(params));
  }
}
