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

  /** Pixel data textarea — `#pixel_data`. */
  readonly pixelDataInput: Locator;

  /** Save image button — `#save_image`. */
  readonly saveButton: Locator;

  /** Finish level button — `#finished`. */
  readonly finishButton: Locator;

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
    this.pixelDataInput = page.locator('#pixel_data');
    this.saveButton = page.locator('#save_image');
    this.finishButton = page.locator('#finished');
  }

  /**
   * Navigate to a pixelation level anonymously, dismiss the instructions
   * dialog, and wait for pixel data to load.  Calls `/reset_session` first to
   * ensure a clean anonymous state.
   *
   * @param level - level number within lesson 17
   */
  async gotoLevel(level: number): Promise<void> {
    await this.page.goto('/reset_session');
    await this.page.goto(labLevelUrl(17, level));
    await this.closeButton.waitFor({state: 'visible'});
    await this.closeButton.click();
    await this.modalBody.waitFor({state: 'hidden'});
    await this.waitForPixelData();
  }

  /**
   * Navigate to a pixelation level without resetting the session.  Use this
   * when the page already has a signed-in student session that must be
   * preserved for server-side save/finish calls.
   *
   * @param level - level number within lesson 17
   */
  async gotoLevelWithAuth(level: number): Promise<void> {
    await this.page.goto(labLevelUrl(17, level));
    await this.closeButton.waitFor({state: 'visible'});
    await this.closeButton.click();
    await this.modalBody.waitFor({state: 'hidden'});
    await this.waitForPixelData();
  }

  /**
   * Wait until `#pixel_data` has a non-empty value.
   * Mirrors `I wait until pixelation data loads`.
   */
  async waitForPixelData(): Promise<void> {
    await this.page.waitForFunction(() => {
      const el = document.querySelector(
        '#pixel_data',
      ) as HTMLInputElement | null;
      return el !== null && el.value !== '';
    });
  }

  /**
   * Return the current pixel data value with all whitespace collapsed
   * to match the Cucumber step's gsub(/[ \n]/, '') comparison.
   */
  async pixelDataNormalized(): Promise<string> {
    const val = await this.pixelDataInput.inputValue();
    return val.replace(/[ \n]/g, '');
  }

  /**
   * Click the save button, wait for all in-flight network requests to settle,
   * reload, dismiss the instruction dialog, and wait for pixel data to reload.
   * Mirrors `I save pixelation data and reload`.
   */
  async saveAndReload(): Promise<void> {
    await this.saveButton.click();
    await this.page.waitForLoadState('networkidle');
    await this.page.reload();
    await this.closeButton.waitFor({state: 'visible'});
    await this.closeButton.click();
    await this.modalBody.waitFor({state: 'hidden'});
    await this.waitForPixelData();
  }

  /**
   * Click the finish button, wait for navigation away from the current level,
   * return to the same level URL, dismiss the dialog, and wait for pixel data.
   * Mirrors `I finish pixelation level and reload`.
   */
  async finishAndReload(): Promise<void> {
    const currentUrl = this.page.url();
    await this.finishButton.click();
    await this.page.waitForURL(url => url.href !== currentUrl, {
      timeout: 30_000,
    });
    await this.page.goto(currentUrl);
    await this.closeButton.waitFor({state: 'visible'});
    await this.closeButton.click();
    await this.modalBody.waitFor({state: 'hidden'});
    await this.waitForPixelData();
  }

  /**
   * Move the cursor to the end of `#pixel_data` via `setSelectionRange` and
   * type the given string character by character.
   * Mirrors `I press keys "X" for element "#pixel_data"`.
   *
   * Uses setSelectionRange to ensure caret is at the end before typing —
   * required for Safari/WebKit where focusing alone may not move the caret.
   *
   * @param chars - characters to type
   */
  async typeInPixelData(chars: string): Promise<void> {
    await this.pixelDataInput.focus();
    await this.selectEndOfPixelData();
    await this.pixelDataInput.pressSequentially(chars);
  }

  /**
   * Move the text-insertion caret to the end of `#pixel_data`.
   * Mirrors `I select the end of "#pixel_data"`.
   * Needed as a workaround for Safari/WebKit where focusing may not move caret.
   */
  async selectEndOfPixelData(): Promise<void> {
    await this.page.evaluate(() => {
      const el = document.querySelector(
        '#pixel_data',
      ) as HTMLTextAreaElement | null;
      if (el) el.setSelectionRange(9999, 9999);
    });
  }

  /**
   * Press a named key on the given locator.
   * Mirrors `I press keys ":arrow_up" for element "#width"`.
   *
   * @param locator - target element
   * @param playwrightKey - Playwright key name, e.g. 'ArrowUp', 'Backspace'
   */
  async pressKey(locator: Locator, playwrightKey: string): Promise<void> {
    await locator.focus();
    await locator.press(playwrightKey);
  }
}
