import {type Locator, type Page} from '@playwright/test';

import {cssColorMatchesVar} from '../shared/colors';
import {unitOverviewUrl, type UnitOverviewUrlParams} from '../shared/routes';

import {BasePage} from './base-page';

/** The unit overview page (course/unit index listing lessons and levels). */
export class UnitOverviewPage extends BasePage {
  /** Summary progress table; one row per lesson, one bubble per level. */
  private readonly summaryProgressTable: Locator;

  constructor(page: Page) {
    super(page);
    this.summaryProgressTable = page.locator('.uitest-summary-progress-table');
  }

  /** Navigate to the unit overview page. */
  async goto(params: UnitOverviewUrlParams = {}): Promise<void> {
    await this.page.goto(unitOverviewUrl(params));
  }

  /** A lesson's name cell in the summary table, by its visible text. */
  lessonCell(name: string | RegExp): Locator {
    return this.page.getByRole('cell', {name});
  }

  /** Progress bubble for a 1-based lesson/level pair (see progress.rb's summary selector). */
  summaryProgressBubble(lesson: number, level: number): Locator {
    return this.summaryProgressTable
      .locator('.uitest-summary-progress-row')
      .nth(lesson - 1)
      .locator('.progress-bubble')
      .nth(level - 1);
  }

  /**
   * Whether the given lesson/level bubble shows 'perfect', comparing its colors
   * to the DSCO success tokens the way progress.rb verify_progress does.
   */
  async isProgressBubblePerfect(
    lesson: number,
    level: number,
  ): Promise<boolean> {
    const bubble = this.summaryProgressBubble(lesson, level);
    return (
      (await cssColorMatchesVar({
        locator: bubble,
        colorProperty: 'background-color',
        cssVar: '--background-success-primary',
      })) &&
      (await cssColorMatchesVar({
        locator: bubble,
        colorProperty: 'border-top-color',
        cssVar: '--borders-success-primary',
      }))
    );
  }

  /**
   * Whether the given lesson/level bubble shows 'not_tried', comparing its
   * colors to the DSCO neutral tokens the way progress.rb verify_progress does.
   */
  async isProgressBubbleNotTried(
    lesson: number,
    level: number,
  ): Promise<boolean> {
    const bubble = this.summaryProgressBubble(lesson, level);
    return (
      (await cssColorMatchesVar({
        locator: bubble,
        colorProperty: 'background-color',
        cssVar: '--background-neutral-primary',
      })) &&
      (await cssColorMatchesVar({
        locator: bubble,
        colorProperty: 'border-top-color',
        cssVar: '--borders-neutral-primary',
      }))
    );
  }
}
