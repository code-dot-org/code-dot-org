import {type Locator, type Page} from '@playwright/test';

import {progressBubbleShows} from '../shared/colors';

import {BasePage} from './base-page';

/**
 * A level played within a lesson — multi levels, Blockly labs, etc. Owns the
 * lesson-progress header, which the server shows only inside a lesson (see
 * should_show_progress in _header.html.haml) — not on standalone /levels views,
 * sign-in, or dashboards.
 */
export class LessonLevelPage extends BasePage {
  /** Lesson-progress strip; one bubble link per level. */
  readonly lessonProgress: Locator;

  /**
   * The whole lesson header block: title, save-status timestamp, progress
   * bubbles.
   */
  readonly lessonHeaderInfo: Locator;

  constructor(page: Page) {
    super(page);
    this.lessonProgress = page.locator('.header_level .react_stage');
    this.lessonHeaderInfo = page.locator('.header_level');
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
