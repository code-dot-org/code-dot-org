import {type Page} from '@playwright/test';

import {expect, test} from '../../shared/fixtures';

import {Pixelation} from './Pixelation';

/**
 * Pixelation widget — @as_student scenarios requiring server-side persistence.
 *
 * Source: dashboard/test/ui/features/star_labs/pixelation.feature
 * Scenarios 1-4 (all @as_student):
 *   1. Binary v2 b/w: type bits, finish+reload persists, switch hex, type, save+reload expands
 *   2. Binary v3 color: type bits, finish+reload persists, switch hex, type, save+reload expands
 *   3. Slider keyboard accessibility: arrow keys, backspace+digit for #width/#height
 *   4. Hex v3 starting in hex: type hex, finish+reload persists, switch binary, append, save+reload converts
 *
 * Navigation uses gotoLevelWithAuth (no /reset_session) to preserve the student session.
 */

/** Strip spaces and newlines — mirrors Cucumber's gsub(/[ \n]/, ''). */
function norm(s: string): string {
  return s.replace(/[ \n]/g, '');
}

/**
 * Poll until #pixel_data's normalized value equals `expected`.
 * Used after encoding-mode switches and keyboard interactions that
 * trigger async React state updates.
 *
 * @param page - Playwright page
 * @param expected - target normalized pixel data string (no spaces/newlines)
 */
async function waitForPixelData(page: Page, expected: string): Promise<void> {
  await page.waitForFunction(
    exp => {
      const el = document.querySelector(
        '#pixel_data',
      ) as HTMLInputElement | null;
      return el !== null && el.value.replace(/[ \n]/g, '') === exp;
    },
    expected,
    {timeout: 15_000},
  );
}

test.describe('Pixelation — auth scenarios', {tag: '@no_mobile'}, () => {
  /**
   * Source: "Pixelation version 2 in black and white with no sliders"
   *
   * Level 1 starts in binary mode.  After typing a bit, finishing and
   * reloading persists the added bit.  Switching to hex and typing a hex
   * nibble, then saving and reloading converts back to binary with the
   * new nibble appended.
   */
  test('v2 b/w: finish persists bits; hex append save+reload expands', async ({
    studentPage,
  }) => {
    const pix = new Pixelation(studentPage);
    await pix.gotoLevelWithAuth(1);

    // Initial state: header (width=3, height=2) + 3 pixel bits
    const INITIAL = norm('0000 0011 0000 0010 0 1 0');
    await waitForPixelData(studentPage, INITIAL);
    expect(await pix.pixelDataNormalized()).toBe(INITIAL);

    // Type one bit — appends to pixel stream
    const AFTER_TYPE = norm('0000 0011 0000 0010 0 1 0 1');
    await pix.typeInPixelData('1');
    await waitForPixelData(studentPage, AFTER_TYPE);
    expect(await pix.pixelDataNormalized()).toBe(AFTER_TYPE);

    // Finish and reload — server persists the new bit
    await pix.finishAndReload();
    expect(await pix.pixelDataNormalized()).toBe(AFTER_TYPE);

    // Switch to hex — header and pixels re-encoded
    const HEX_STATE = norm('03 02 5');
    await pix.hexRadio.click();
    await waitForPixelData(studentPage, HEX_STATE);
    expect(await pix.pixelDataNormalized()).toBe(HEX_STATE);

    // Type hex nibble, save, reload — hex nibble expands back to binary bits
    const AFTER_SAVE = norm('0000 0011 0000 0010 0 1 0 1 1 1 1 1');
    await pix.typeInPixelData('F');
    await pix.saveAndReload();
    expect(await pix.pixelDataNormalized()).toBe(AFTER_SAVE);
  });

  /**
   * Source: "Pixelation version 3 in color with sliders"
   *
   * Level 2 is color (3-channel) binary.  After typing 3 bits,
   * finish+reload persists them.  Switching to hex, typing 2 hex chars,
   * saving and reloading back expands the hex back to binary.
   */
  test('v3 color: finish persists bits; hex append save+reload expands', async ({
    studentPage,
  }) => {
    const pix = new Pixelation(studentPage);
    await pix.gotoLevelWithAuth(2);

    const INITIAL = norm(
      '0000 0100 0000 0010 0000 0011 000 111 100 010 001 110',
    );
    await waitForPixelData(studentPage, INITIAL);
    expect(await pix.pixelDataNormalized()).toBe(INITIAL);

    // Type 3 bits — one full color-channel group
    const AFTER_TYPE = norm(
      '0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111',
    );
    await pix.typeInPixelData('111');
    await waitForPixelData(studentPage, AFTER_TYPE);
    expect(await pix.pixelDataNormalized()).toBe(AFTER_TYPE);

    // Finish and reload — server persists the new bits
    await pix.finishAndReload();
    expect(await pix.pixelDataNormalized()).toBe(AFTER_TYPE);

    // Switch to hex — header and pixels re-encoded
    const HEX_STATE = norm('04 02 03 1E23B8');
    await pix.hexRadio.click();
    await waitForPixelData(studentPage, HEX_STATE);
    expect(await pix.pixelDataNormalized()).toBe(HEX_STATE);

    // Type 2 hex chars, save, reload — expands back to binary
    const AFTER_SAVE = norm(
      '0000 0100 0000 0010 0000 0011 000 111 100 010 001 110 111 000 111 000 01',
    );
    await pix.typeInPixelData('e1');
    await pix.saveAndReload();
    expect(await pix.pixelDataNormalized()).toBe(AFTER_SAVE);
  });

  /**
   * Source: "Pixelation slider input fields are accessible via keyboard keys"
   *
   * Level 2.  Arrow keys on #width/#height update pixel data header bytes.
   * Backspace + digit directly edits the dimension number input.
   */
  test('slider keyboard: arrow keys and direct digit entry update pixel data', async ({
    studentPage,
  }) => {
    const pix = new Pixelation(studentPage);
    await pix.gotoLevelWithAuth(2);

    const INITIAL = norm(
      '0000 0100 0000 0010 0000 0011 000 111 100 010 001 110',
    );
    await waitForPixelData(studentPage, INITIAL);

    // ArrowUp on width: 0000 0100 (4) → 0000 0101 (5)
    const W5 = norm('0000 0101 0000 0010 0000 0011 000 111 100 010 001 110');
    await pix.pressKey(pix.widthInput, 'ArrowUp');
    await waitForPixelData(studentPage, W5);
    expect(await pix.pixelDataNormalized()).toBe(W5);

    // ArrowDown on width: back to 0000 0100 (4)
    await pix.pressKey(pix.widthInput, 'ArrowDown');
    await waitForPixelData(studentPage, INITIAL);
    expect(await pix.pixelDataNormalized()).toBe(INITIAL);

    // ArrowUp on height: 0000 0010 (2) → 0000 0011 (3)
    const H3 = norm('0000 0100 0000 0011 0000 0011 000 111 100 010 001 110');
    await pix.pressKey(pix.heightInput, 'ArrowUp');
    await waitForPixelData(studentPage, H3);
    expect(await pix.pixelDataNormalized()).toBe(H3);

    // ArrowDown on height: back to 0000 0010 (2)
    await pix.pressKey(pix.heightInput, 'ArrowDown');
    await waitForPixelData(studentPage, INITIAL);
    expect(await pix.pixelDataNormalized()).toBe(INITIAL);

    // Backspace + 7 on height: 0000 0010 → 0000 0111 (7)
    const H7 = norm('0000 0100 0000 0111 0000 0011 000 111 100 010 001 110');
    await pix.pressKey(pix.heightInput, 'Backspace');
    await pix.pressKey(pix.heightInput, '7');
    await waitForPixelData(studentPage, H7);
    expect(await pix.pixelDataNormalized()).toBe(H7);

    // Backspace + 7 on width: 0000 0100 → 0000 0111 (7)
    const W7H7 = norm('0000 0111 0000 0111 0000 0011 000 111 100 010 001 110');
    await pix.pressKey(pix.widthInput, 'Backspace');
    await pix.pressKey(pix.widthInput, '7');
    await waitForPixelData(studentPage, W7H7);
    expect(await pix.pixelDataNormalized()).toBe(W7H7);
  });

  /**
   * Source: "Pixelation version 3 in color with sliders starting in hex mode"
   *
   * Level 3 starts in hex mode.  Typing a 6-char hex color, finishing and
   * reloading persists it.  Switching to binary, moving caret to end,
   * typing a long binary string, then saving and reloading converts back
   * to hex with the new color appended.
   */
  test('v3 hex-start: finish persists hex; binary append save+reload converts', async ({
    studentPage,
  }) => {
    const pix = new Pixelation(studentPage);
    await pix.gotoLevelWithAuth(3);

    const INITIAL = norm('04 04 18 FF0000 00AAAA');
    await waitForPixelData(studentPage, INITIAL);
    expect(await pix.pixelDataNormalized()).toBe(INITIAL);

    // Type 6-char hex color
    const AFTER_TYPE = norm('04 04 18 FF0000 00AAAA 999999');
    await pix.typeInPixelData('999999');
    await waitForPixelData(studentPage, AFTER_TYPE);
    expect(await pix.pixelDataNormalized()).toBe(AFTER_TYPE);

    // Finish and reload — server persists the new color
    await pix.finishAndReload();
    expect(await pix.pixelDataNormalized()).toBe(AFTER_TYPE);

    // Switch to binary — re-encodes all pixel data
    const BIN_STATE = norm(
      '0000 0100 0000 0100 0001 1000 111111110000000000000000 000000001010101010101010 100110011001100110011001 ',
    );
    await pix.binRadio.click();
    await waitForPixelData(studentPage, BIN_STATE);
    expect(await pix.pixelDataNormalized()).toBe(BIN_STATE);

    // Caret to end (Safari workaround), then type binary string
    const AFTER_BIN_TYPE = norm(
      '0000 0100 0000 0100 0001 1000 111111110000000000000000 000000001010101010101010 100110011001100110011001 110011001100110011111111',
    );
    await pix.selectEndOfPixelData();
    await pix.typeInPixelData('110011001100110011111111');
    await waitForPixelData(studentPage, AFTER_BIN_TYPE);
    expect(await pix.pixelDataNormalized()).toBe(AFTER_BIN_TYPE);

    // Save and reload — binary compresses back to hex; new color = CCCCFF
    const AFTER_SAVE = norm('04 04 18 FF0000 00AAAA 999999 CCCCFF');
    await pix.saveAndReload();
    expect(await pix.pixelDataNormalized()).toBe(AFTER_SAVE);
  });
});
