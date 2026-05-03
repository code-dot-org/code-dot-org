import {type Locator, type Page} from '@playwright/test';

import {labLevelUrl} from '../../../shared/urls';
import {LegacyBlocklyLab} from '../../shared/LegacyBlocklyLab';

/**
 * Page Object for Sprite Lab — p5.js + Blockly CSF activity.
 *
 * Uses allthethingscourse lesson 36.
 * Extends LegacyBlocklyLab for the shared run/reset/congrats interface.
 * Adds the p5 loading barrier and Blockly grid dropdown interaction helpers.
 */
export class SpriteLab extends LegacyBlocklyLab {
  /** Avatar sprite image shown on level load — `img[src*="spritelab/avatar"]`. */
  readonly spriteAvatarImage: Locator;

  /** Blockly field dropdown div — appears when a field editor is opened. */
  readonly dropdown: Locator;

  constructor(page: Page) {
    super(page);
    this.spriteAvatarImage = page.locator('img[src*="spritelab/avatar"]');
    this.dropdown = page.locator('.blocklyDropDownDiv');
  }

  /** Lesson 36 of allthethingscourse — used by LegacyBlocklyLab.gotoLevel(). */
  protected buildLevelUrl(level: number): string {
    return labLevelUrl(36, level);
  }

  /**
   * Wait for the run button and for the p5 canvas loading barrier to clear.
   * SpriteLab mounts the Blockly workspace before p5 finishes; #p5_loading
   * disappears once the p5 canvas is ready to accept interaction.
   */
  protected override async waitForInitialLoad(): Promise<void> {
    await this.runButton.waitFor({state: 'visible'});
    await this.page.locator('#p5_loading').waitFor({state: 'hidden'});
  }

  /**
   * Dispatch pointerdown + pointerup on the nth element matching selector.
   * Mirrors `I click block field "selector" number N` from blockly.rb:
   *   $("selector")[N].dispatchEvent(new PointerEvent('pointerdown', ...))
   * Opens Blockly field editors (color pickers, grid dropdowns, etc.)
   * on the targeted editable field.
   *
   * Uses locator.dispatchEvent() rather than evaluate() so that WebKit
   * receives correctly-formed PointerEvents via Playwright's event dispatch path.
   *
   * @param selector - CSS selector for the editable field elements
   * @param index - zero-based index into the NodeList of matching elements
   */
  async clickBlockFieldAt(selector: string, index: number): Promise<void> {
    const locator = this.page.locator(selector).nth(index);
    await locator.dispatchEvent('pointerdown', {bubbles: true});
    await locator.dispatchEvent('pointerup', {bubbles: true});
  }

  /**
   * Click the nth item in the currently open Blockly grid dropdown.
   * Mirrors `I select item N from the dropdown`:
   *   @browser.find_elements(:class, 'blocklyFieldGridItem')[N].click
   *
   * Uses evaluate() after waiting for attachment because Blockly re-renders
   * the grid during its dropdown open animation — Playwright's stability check
   * treats the brief detach as a retry signal and times out in WebKit.
   *
   * @param index - zero-based index into .blocklyFieldGridItem elements
   */
  async selectDropdownItem(index: number): Promise<void> {
    await this.page
      .locator('.blocklyFieldGridItem')
      .nth(index)
      .waitFor({state: 'attached'});
    await this.page.evaluate(idx => {
      const items = document.querySelectorAll('.blocklyFieldGridItem');
      (items[idx] as HTMLElement)?.click();
    }, index);
  }
}
