import {type Locator, type Page} from '@playwright/test';

import {progressBubbleShows} from '../shared/progress';
import {unitOverviewUrl, type UnitOverviewUrlParams} from '../shared/routes';

import {BasePage} from './base-page';
import {PROGRESS_LESSON_SELECTOR} from './lesson-level-page';

/** A 1-based lesson/level position within the unit's summary progress table. */
export interface LessonLevelRef {
  lesson: number;
  level: number;
}

/** The unit overview page (course/unit index listing lessons and levels). */
export class UnitOverviewPage extends BasePage {
  /** Summary progress table; a11y scans scope here, not the shared chrome. */
  readonly summaryTableSelector = '.uitest-summary-progress-table';

  /** Summary progress table; one row per lesson, one bubble per level. */
  private readonly summaryProgressTable: Locator;

  /**
   * Per-lesson progress cards, one per lesson, each showing the lesson's
   * displayed name (unnumbered courses omit the "Lesson N" prefix).
   */
  readonly progressLessons: Locator;

  constructor(page: Page) {
    super(page);
    this.summaryProgressTable = page.locator(this.summaryTableSelector);
    this.progressLessons = page.locator(PROGRESS_LESSON_SELECTOR);
  }

  /** Navigate to the unit overview page. */
  async gotoOverview(params: UnitOverviewUrlParams = {}): Promise<void> {
    await this.page.goto(unitOverviewUrl(params));
  }

  /** A lesson's name cell in the summary table, by its visible text. */
  lessonCell(name: string | RegExp): Locator {
    return this.page.getByRole('cell', {name});
  }

  /** Progress bubble for a 1-based lesson/level pair (see progress.rb's summary selector). */
  summaryProgressBubble({lesson, level}: LessonLevelRef): Locator {
    return this.summaryProgressTable
      .locator('.uitest-summary-progress-row')
      .nth(lesson - 1)
      .locator('.progress-bubble')
      .nth(level - 1);
  }

  /** Whether the given lesson/level summary bubble shows 'perfect' (see progress.rb verify_progress). */
  async isProgressBubblePerfect(ref: LessonLevelRef): Promise<boolean> {
    return progressBubbleShows({
      bubble: this.summaryProgressBubble(ref),
      state: 'perfect',
    });
  }

  /** Whether the given lesson/level summary bubble shows 'not_tried' (see progress.rb verify_progress). */
  async isProgressBubbleNotTried(ref: LessonLevelRef): Promise<boolean> {
    return progressBubbleShows({
      bubble: this.summaryProgressBubble(ref),
      state: 'not_tried',
    });
  }

  /** Whether the given lesson/level summary bubble shows 'attempted' (see progress.rb verify_progress). */
  async isProgressBubbleAttempted(ref: LessonLevelRef): Promise<boolean> {
    return progressBubbleShows({
      bubble: this.summaryProgressBubble(ref),
      state: 'attempted',
    });
  }
}
