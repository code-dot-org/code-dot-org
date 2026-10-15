import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/**
 * Page object for the 'standalone_video' level type: a video (embedded
 * player + download link) with a single Continue button that both records a
 * milestone and navigates on to whatever the curriculum decides comes next
 * (not necessarily back to this level).
 */
export class StandaloneVideoLevel extends LessonLevelPage {
  /**
   * The level's own widget container (see _standalone_video.html.haml), not
   * the generic #main_content landmark BasePage already exposes — narrower
   * scope for a11y scans, and consistent with MultiLevel/SketchLab/WebLab2.
   */
  readonly rootSelector = '.standalone-video';

  /** Continue button: fires the milestone POST, then navigates on click. */
  readonly continueButton: Locator;

  readonly videoIframeSelector = '#video';

  /**
   * Cross-origin youtube-nocookie.com player. Keep it out of accessibility
   * baselines: the server sends no title attribute, then the YouTube script
   * adds one, so axe frame-title fails or passes by timing alone.
   */
  readonly videoIframe: Locator;

  constructor(page: Page) {
    super(page);
    this.continueButton = page
      .locator(this.rootSelector)
      .getByRole('button', {name: 'Continue'});
    this.videoIframe = page.locator(this.videoIframeSelector);
  }

  /** Navigate to a standalone-video level and wait for the widget to render. */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.waitForReady();
  }

  /** The level is ready once its Continue button is visible. */
  async waitForReady(): Promise<void> {
    await expect(this.continueButton).toBeVisible();
  }

  /**
   * Click Continue and wait for the resulting navigation. The milestone POST
   * fires first and only its callback sets window.location.href, to a
   * curriculum-decided next page that is not necessarily this level — so
   * readiness here is "we left the original URL", not any destination content.
   */
  async continue(): Promise<void> {
    const before = this.page.url();
    await this.continueButton.click();
    await this.page.waitForURL(url => url.toString() !== before);
  }
}
