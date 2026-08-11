import {expect, type Locator, type Page} from '@playwright/test';

import {IntroVideoModalComponent} from '../components/intro-video-modal';
import {progressBubbleShows} from '../shared/progress';
import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {BasePage} from './base-page';

/**
 * Uitest hook for the per-lesson progress card, one per lesson — the same
 * component tree (HeaderPopup -> MiniView -> ProgressTable -> ProgressLesson)
 * rendered here (inside the header popup) and on UnitOverviewPage.
 */
export const PROGRESS_LESSON_SELECTOR = '.uitest-progress-lesson';

/**
 * A level played within a lesson — multi levels, Blockly labs, etc. Owns the
 * lesson-progress header, which the server shows only inside a lesson (see
 * should_show_progress in _header.html.haml) — not on standalone /levels views,
 * sign-in, or dashboards.
 */
export class LessonLevelPage extends BasePage {
  /** Lesson-progress strip; a11y scans scope here, not the shared chrome. */
  readonly progressSelector = '.header_level .react_stage';

  /** Header popup container; a11y scans scope here once it's open. */
  readonly headerPopupSelector = '.header_popup';

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
   * Per-lesson progress cards inside the header popup, one per lesson.
   * Absent from the DOM entirely until headerPopupButton is clicked. No
   * accessible role/name is exposed, so addressed by its uitest hook class.
   */
  readonly progressLessons: Locator;

  /** Intro video-tutorial overlay — any level type can autoplay it on first load. */
  readonly introVideoModal: IntroVideoModalComponent;

  constructor(page: Page) {
    super(page);
    this.introVideoModal = new IntroVideoModalComponent(page);
    this.lessonProgress = page.locator(this.progressSelector);
    this.lessonHeaderInfo = page.locator('.header_level');
    this.headerPopupButton = page.locator('button.header_popup_link');
    this.progressLessons = page.locator(PROGRESS_LESSON_SELECTOR);
  }

  /** Navigate to a lab level. */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
  }

  /** Open the header popup and wait for its progress cards to render. */
  async openHeaderPopup(): Promise<void> {
    await this.headerPopupButton.click();
    await expect(this.progressLessons.first()).toBeVisible();
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

  /** Whether the level's header bubble shows 'attempted' (see progress.rb verify_progress). */
  async isProgressBubbleAttempted(levelNum: number): Promise<boolean> {
    return progressBubbleShows({
      bubble: this.headerProgressBubble(levelNum),
      state: 'attempted',
    });
  }
}
