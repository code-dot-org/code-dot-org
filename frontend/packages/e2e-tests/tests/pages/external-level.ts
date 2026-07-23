import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/**
 * Page object for the 'external' level type: server-rendered markdown with no
 * code editor/console (no #runButton, unlike the Blockly labs). Used e.g. by
 * allthethingscourse/unit 1/lesson 21/level 1 to test markdown rendering.
 */
export class ExternalLevel extends LessonLevelPage {
  /** Marker element appended at the end of the authored markdown body. */
  readonly extraDetailsTag: Locator;

  /** A <details> element authored via markdown, collapsed until its summary is clicked. */
  readonly coolList: Locator;

  /** The <summary> toggle for coolList. */
  readonly summaryTag: Locator;

  constructor(page: Page) {
    super(page);
    this.extraDetailsTag = page.locator('#extra-details-tag');
    this.coolList = page.locator('#cool-list');
    this.summaryTag = page.locator('#summary-tag');
  }

  /**
   * Navigate to an external-markdown level. The markup is server-rendered, so
   * there is no lab-console readiness gate (no #runButton) to wait on — only
   * the DOM content itself.
   *
   * extraDetailsTag is authored *inside* the collapsed #cool-list <details>
   * (that nesting is the very thing this scenario exercises), so it is
   * present but not visible until the <details> is expanded. Wait for DOM
   * attachment only, matching the original Selenium step ("I wait to see"),
   * which used `find_elements` and never asserted visibility.
   */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await expect(this.extraDetailsTag).toBeAttached();
  }

  /** Click the summary to toggle the <details> element open/closed. */
  async toggleCoolList(): Promise<void> {
    await this.summaryTag.click();
  }
}
