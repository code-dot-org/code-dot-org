import {expect, type Locator, type Page} from '@playwright/test';

import {type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/**
 * Page object for an external markdown level (dashboard's "external" level
 * type), which renders authored markdown — including raw HTML like
 * <details>/<summary> — directly into the level body via SafeMarkdown.
 */
export class MarkdownLevel extends LessonLevelPage {
  /** <p id="extra-details-tag">, nested inside the collapsible list below. */
  readonly extraDetailsTag: Locator;

  /** <details id="cool-list"> — collapsible list; closed until its summary is clicked. */
  readonly detailsList: Locator;

  /** <summary id="summary-tag"> — click target that toggles detailsList open/closed. */
  readonly summaryTag: Locator;

  constructor(page: Page) {
    super(page);
    // No accessible name/role on these authored ids — plain markdown/raw HTML
    // from level content, not app-rendered semantic controls.
    this.extraDetailsTag = page.locator('#extra-details-tag');
    this.detailsList = page.locator('#cool-list');
    this.summaryTag = page.locator('#summary-tag');
  }

  /**
   * Navigate to a markdown level. Content (including the closed <details>)
   * ships in the initial document HTML — no lab boot to await, unlike
   * LegacyBlocklyLab.gotoLevel.
   */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.navigateToLevel(params);
  }

  /**
   * Click the <summary> to toggle detailsList open, then wait for the
   * 'open' attribute itself (Cucumber: element_open? / jquery_is_element_open)
   * as the readiness signal for the toggle — the click's DOM update is not
   * guaranteed synchronous with the click resolving.
   */
  async openDetailsList(): Promise<void> {
    await this.summaryTag.click();
    await expect(this.detailsList).toHaveAttribute('open', '');
  }
}
