import {expect, type Locator, type Page} from '@playwright/test';

import {LegacyBlocklyLab} from '../shared/LegacyBlocklyLab';

/**
 * Page Object for an Hour of Code level (/hoc/N).
 *
 * Covers clear-puzzle, progress tracking, video modals, and callout tooltips.
 */
export class HocLevel extends LegacyBlocklyLab {
  /** Generic modal overlay — `.modal`. */
  readonly modal: Locator;

  /** Intro video modal — `.video-modal`. */
  readonly videoModal: Locator;

  /** Callout tooltip container — `.cdo-qtips`. */
  readonly callouts: Locator;

  /** User-stats block on the course overview page — `.user-stats-block`. */
  readonly userStatsBlock: Locator;

  /** Last reference-area link — `.reference_area a`. */
  readonly referenceAreaLink: Locator;

  constructor(page: Page) {
    super(page);
    this.modal = page.locator('.modal');
    this.videoModal = page.locator('.video-modal');
    this.callouts = page.locator('.cdo-qtips');
    this.userStatsBlock = page.locator('.user-stats-block');
    this.referenceAreaLink = page.locator('.reference_area a').last();
  }
  protected buildLevelUrl(level: number): string {
    return `/hoc/${level}?noautoplay=true`;
  }

  /**
   * Navigate directly to a level and dismiss the instructions overlay.
   * Use for mid-test navigation that should preserve the current session
   * (e.g. after solving a puzzle).  Unlike gotoLevel(), this does NOT call
   * /reset_session, so client-side progress (localStorage) is preserved.
   *
   * The #overlay (instructions curtain) renders after #runButton, so
   * waitForReady() may return before it appears.  We wait up to 1 s for
   * it to appear, then dismiss it via dismissOptionalOverlays().
   */
  async loadLevel(level: number): Promise<void> {
    await this.page.goto(this.buildLevelUrl(level));
    await this.waitForReady();
    // Give the overlay up to 1 s to render after runButton is visible.
    await this.page
      .locator('#overlay')
      .waitFor({state: 'visible', timeout: 1000})
      .catch(() => {});
    await this.dismissOptionalOverlays();
  }

  /**
   * Locator for a callout tooltip containing the given text.
   *
   * @param text - substring to match against `.qtip-content`
   */
  callout(text: string): Locator {
    return this.page.locator('.qtip-content', {hasText: text});
  }

  /**
   * Close the puzzle-congrats modal (`.modal`) and wait for it to be hidden.
   * Clicks the `#x-close` button inside the modal.
   */
  async closeModal(): Promise<void> {
    await this.page.locator('#x-close').click();
    await expect(this.modal).toBeHidden();
  }

  /**
   * Close the intro video modal (`.video-modal`) and wait for it to be hidden.
   * Clicks the `#x-close` button inside the video modal.
   */
  async closeVideoModal(): Promise<void> {
    await this.page.locator('#x-close').click();
    await expect(this.videoModal).toBeHidden();
  }

  /** Click the clear-puzzle toolbar button to open the confirmation modal. */
  async clearPuzzle(): Promise<void> {
    await this.page.locator('#clear-puzzle-header').click();
  }

  /**
   * Wait for the clear-puzzle confirmation modal and click the confirm button.
   * Must be called after clearPuzzle().
   */
  async confirmClear(): Promise<void> {
    await expect(this.page.locator('.modal')).toBeVisible();
    await this.page.locator('#confirm-button').click();
  }

  /**
   * Assert that childId's SVG element is a direct DOM child of parentId's
   * SVG element. Mirrors "block is child of block" from blockly.rb.
   *
   * @param childId - data-id of the child block
   * @param parentId - expected data-id of the parent element
   */
  async expectBlockIsChildOf(childId: string, parentId: string): Promise<void> {
    const child = this.blockLocator(childId);
    await expect(child.locator('xpath=..')).toHaveAttribute(
      'data-id',
      parentId,
    );
  }

  /**
   * Header progress bubble for the given level (1-based).
   * Mirrors header_bubble_selector(level) from progress.rb.
   */
  progressBubble(level: number): Locator {
    return this.page
      .locator('.header_level .react_stage a')
      .nth(level - 1)
      .locator('.progress-bubble');
  }

  /**
   * Progress bubble in the course overview summary table.
   * Mirrors verify_progress(selector, …) from progress.rb.
   *
   * @param lesson - 1-based lesson index
   * @param level  - 1-based level index within the lesson
   */
  progressBubbleOnOverview(lesson: number, level: number): Locator {
    return this.page
      .locator('.uitest-summary-progress-table .uitest-summary-progress-row')
      .nth(lesson - 1)
      .locator('.progress-bubble')
      .nth(level - 1);
  }

  /**
   * Assert that the header progress bubble for the given level matches state.
   *
   * CSS values from progress.rb color_string():
   *   not_tried  — bg rgb(254,254,254)  border rgb(198,202,205)
   *   attempted  — bg rgb(254,254,254)  border rgb(14,190,14)
   *   perfect    — bg rgb(14,190,14)    border rgb(14,190,14)
   *
   * @param level - 1-based level number
   * @param state - progress state name
   */
  async expectProgressInHeader(
    level: number,
    state: 'not_tried' | 'attempted' | 'perfect',
  ): Promise<void> {
    const bgColor =
      state === 'perfect' ? 'rgb(14, 190, 14)' : 'rgb(254, 254, 254)';
    const borderColor =
      state === 'not_tried' ? 'rgb(198, 202, 205)' : 'rgb(14, 190, 14)';
    const bubble = this.progressBubble(level);
    await expect(bubble).toBeVisible();
    await expect(bubble).toHaveCSS('background-color', bgColor);
    await expect(bubble).toHaveCSS('border-top-color', borderColor);
  }

  /**
   * Assert that the course-overview progress bubble for lesson/level matches state.
   *
   * @param lesson - 1-based lesson index
   * @param level  - 1-based level index
   * @param state  - progress state name
   */
  async expectProgressOnOverview(
    lesson: number,
    level: number,
    state: 'not_tried' | 'attempted' | 'perfect',
  ): Promise<void> {
    const bgColor =
      state === 'perfect' ? 'rgb(14, 190, 14)' : 'rgb(254, 254, 254)';
    const borderColor =
      state === 'not_tried' ? 'rgb(198, 202, 205)' : 'rgb(14, 190, 14)';
    const bubble = this.progressBubbleOnOverview(lesson, level);
    await expect(bubble).toBeVisible();
    await expect(bubble).toHaveCSS('background-color', bgColor);
    await expect(bubble).toHaveCSS('border-top-color', borderColor);
  }
}
