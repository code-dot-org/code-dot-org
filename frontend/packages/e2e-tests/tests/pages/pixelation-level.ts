import {expect, type Locator, type Page} from '@playwright/test';

import {labLevelUrl, type LabLevelUrlParams} from '../shared/routes';

import {LessonLevelPage} from './lesson-level-page';

/**
 * Page object for the Pixelation widget level type: an interactive image-
 * encoding widget with no code editor/console (no #runButton, unlike the
 * Blockly labs).
 */
export class PixelationLevel extends LessonLevelPage {
  /** Short instructions, shown below the widget; clicking it also opens instructionsDialog. */
  readonly shortInstructions: Locator;

  /** Rendered-markdown body of the long-instructions dialog that opens on the 'ready' event (or on shortInstructions click). */
  readonly instructionsDialog: Locator;

  /**
   * A widget control (apps/src/sites/studio/pages/levels/_pixelation.js
   * enableUiControls) that only enables once an async project-load
   * completes — independent of instructionsDialog opening. Used as the
   * widget's true interactive-readiness signal.
   */
  readonly widthRangeSlider: Locator;

  constructor(page: Page) {
    super(page);
    this.shortInstructions = page.locator('#below_viz_instructions');
    this.instructionsDialog = page.locator(
      '.markdown-instructions-container .instructions-markdown > div',
    );
    this.widthRangeSlider = page.locator('#widthRange');
  }

  /**
   * Navigate to a Pixelation level. This level type has no #runButton, so it
   * cannot use LegacyBlocklyLab's readiness gate and defines its own.
   */
  async gotoLevel(params: LabLevelUrlParams): Promise<void> {
    await this.page.goto(labLevelUrl(params), {waitUntil: 'domcontentloaded'});
    await this.introVideoModal.dismissIfShown();
    // The dialog opens on its own at the 'ready' event, or on clicking the
    // short instructions — whichever wins. Each attempt re-checks rather than
    // racing that, and bounds its click so one blocked attempt can't stall.
    await expect(async () => {
      if (await this.instructionsDialog.isVisible()) {
        return;
      }
      await this.shortInstructions.click({timeout: 1_000}).catch(() => {});
      await expect(this.instructionsDialog).toBeVisible({timeout: 500});
    }).toPass({timeout: 20_000});
    // Gated separately from the dialog, so callers see the widget's steady
    // state rather than a mid-load snapshot.
    await expect(this.widthRangeSlider).toBeEnabled();
  }
}
