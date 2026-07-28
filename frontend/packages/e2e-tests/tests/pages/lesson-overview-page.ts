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
   * prefix). No accessible role/name is exposed beyond its own text, so
   * addressed by its uitest hook class (see the feature's own
   * ".uitest-lesson-title" selector).
   */
  readonly lessonTitle: Locator;

  constructor(page: Page) {
    super(page);
    this.lessonTitle = page.locator('.uitest-lesson-title');
  }

  /** Navigate to the lesson overview page. */
  async gotoOverview(params: LessonOverviewUrlParams): Promise<void> {
    await this.page.goto(lessonOverviewUrl(params));
  }
}
