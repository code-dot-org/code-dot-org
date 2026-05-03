import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../shared/urls';

/**
 * Page Object for the Pixelation widget — lesson 17 of allthethingscourse.
 *
 * Pixelation is not a Blockly lab. It renders a pixel-art editor with controls
 * for encoding format (binary/hex) and canvas dimensions (width/height sliders).
 * Level 4 hides the encoding controls and shows editable sliders;
 * level 5 shows the encoding controls and hides/locks the sliders.
 */
export class Pixelation {
  /** Underlying Playwright page. */
  readonly page: Page;

  /** Generic modal overlay — `.modal`. */
  readonly modal: Locator;

  /** Modal close button — `#x-close`. */
  readonly closeButton: Locator;

  /** Modal body — `.modal-body`. Hidden state confirms dialog dismissal. */
  readonly modalBody: Locator;

  /** Binary encoding radio — `input[name="binHex"][value="bin"]`. */
  readonly binRadio: Locator;

  /** Hex encoding radio — `input[name="binHex"][value="hex"]`. */
  readonly hexRadio: Locator;

  /** Width range slider — `#widthRange`. */
  readonly widthRange: Locator;

  /** Height range slider — `#heightRange`. */
  readonly heightRange: Locator;

  /** Width number input — `#width`. */
  readonly widthInput: Locator;

  /** Height number input — `#height`. */
  readonly heightInput: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.locator('.modal');
    this.closeButton = page.locator('#x-close');
    this.modalBody = page.locator('.modal-body');
    this.binRadio = page.locator('input[name="binHex"][value="bin"]');
    this.hexRadio = page.locator('input[name="binHex"][value="hex"]');
    this.widthRange = page.locator('#widthRange');
    this.heightRange = page.locator('#heightRange');
    this.widthInput = page.locator('#width');
    this.heightInput = page.locator('#height');
  }

  /**
   * Navigate to a pixelation level, dismiss the instructions dialog, and wait
   * for pixel data to load. Mirrors the `gotoPixelationLevel` helper.
   *
   * @param level - level number within lesson 17
   */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(labLevelUrl(17, level));
    await this.closeButton.waitFor({state: 'visible'});
    await this.closeButton.click();
    await this.modalBody.waitFor({state: 'hidden'});
    await this.page.waitForFunction(() => {
      const el = document.querySelector(
        '#pixel_data',
      ) as HTMLInputElement | null;
      return el !== null && el.value !== '';
    });
  }
}
