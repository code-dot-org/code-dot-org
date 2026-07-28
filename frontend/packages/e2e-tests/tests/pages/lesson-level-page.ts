import {type Locator, type Page} from '@playwright/test';

import {progressBubbleShows} from '../shared/progress';
import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {BasePage} from './base-page';

/**
 * A level played within a lesson — multi levels, Blockly labs, etc. Owns the
 * lesson-progress header, which the server shows only inside a lesson (see
 * should_show_progress in _header.html.haml) — not on standalone /levels views,
 * sign-in, or dashboards.
 */
export class LessonLevelPage extends BasePage {
  /** Lesson-progress strip; a11y scans scope here, not the shared chrome. */
  readonly progressSelector = '.header_level .react_stage';

  /** Lesson-progress strip; one bubble link per level. */
  readonly lessonProgress: Locator;

  /**
   * The whole lesson header block: title, save-status timestamp, progress
   * bubbles.
   */
  readonly lessonHeaderInfo: Locator;

  /** Header "More"/"Less" toggle that mounts the lesson-progress summary popup. */
  readonly headerPopupButton: Locator;

  /**
   * Per-lesson progress cards inside the header popup, one per lesson — the
   * same component tree (HeaderPopup -> MiniView -> ProgressTable ->
   * ProgressLesson) as UnitOverviewPage.progressLessons. Absent from the DOM
   * entirely until headerPopupButton is clicked. No accessible role/name is
   * exposed, so addressed by its uitest hook class.
   */
  readonly progressLessons: Locator;

  constructor(page: Page) {
    super(page);
    this.lessonProgress = page.locator(this.progressSelector);
    this.lessonHeaderInfo = page.locator('.header_level');
    this.headerPopupButton = page.locator('button.header_popup_link');
    this.progressLessons = page.locator('.uitest-progress-lesson');
  }

  /** Navigate to a lab level. */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
  }

  /** Open the header popup (lesson-progress summary), toggled by headerPopupButton. */
  async openHeaderPopup(): Promise<void> {
    await this.headerPopupButton.click();
  }

  /** Progress bubble for a 1-based level number (see progress.rb header_bubble_selector). */
  headerProgressBubble(levelNum: number): Locator {
    return this.lessonProgress
      .locator('a')
      .nth(levelNum - 1)
      .locator('.progress-bubble');
  }

  /** Whether the level's header bubble shows 'perfect' (see progress.rb verify_progress). */
  async isProgressBubblePerfect(levelNum: number): Promise<boolean> {
    return progressBubbleShows({
      bubble: this.headerProgressBubble(levelNum),
      state: 'perfect',
    });
  }

  /** Whether the level's header bubble shows 'not_tried' (see progress.rb verify_progress). */
  async isProgressBubbleNotTried(levelNum: number): Promise<boolean> {
    return progressBubbleShows({
      bubble: this.headerProgressBubble(levelNum),
      state: 'not_tried',
    });
  }
}
