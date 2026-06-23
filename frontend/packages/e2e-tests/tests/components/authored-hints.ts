import {expect} from '@playwright/test';
import type {Locator, Page} from '@playwright/test';

import {waitUntilStable} from '../shared/stability';

/**
 * Authored hints: the lightbulb, count badge, and "Yes" confirmation prompt
 * rendered in the CSF instructions panel.
 *
 * In the product this is a feature of the shared legacy CSF instructions UI
 * (apps/src/templates/instructions), available to any pre-Lab2 Blockly lab —
 * not a page of its own. So it's modeled as a component that lab page
 * objects compose (`lab.hints`), mirroring the React component structure.
 */
export class AuthoredHintsComponent {
  /** #lightbulb indicator, present only when hints are available; assert availability (incl. absence) here, don't click. */
  readonly lightbulb: Locator;

  /** Clickable lightbulb (.prompt-icon-cell button) owning the onClick; click here — clicking #lightbulb drops on webkit. */
  readonly lightbulbTrigger: Locator;

  /** Hint count badge; removed from the DOM after the last hint is viewed. */
  readonly hintCount: Locator;

  /** "Yes" confirmation button. exact:true — the lightbulb's name also contains "yes". */
  readonly yesButton: Locator;

  /** Hint content image. `a img` excludes the Immersive Reader button's own <img>. */
  readonly hintImage: Locator;

  constructor(page: Page) {
    this.lightbulb = page.locator('#lightbulb');
    this.lightbulbTrigger = page.getByRole('button', {name: 'lightbulb'});
    this.hintCount = page.locator('#hintCount');
    this.yesButton = page.getByRole('button', {name: 'Yes', exact: true});
    this.hintImage = page.locator('.csf-top-instructions a img');
  }

  /** Click the lightbulb, confirm "Yes", and reveal the next hint. */
  async viewNext(): Promise<void> {
    // Webkit drops a click to focus-only if the target moves (panel reflow/scroll); settle each first.
    await expect(this.lightbulbTrigger).toBeVisible();
    await waitUntilStable(this.lightbulbTrigger);
    await this.lightbulbTrigger.click();
    await expect(this.yesButton).toBeVisible();
    await waitUntilStable(this.yesButton);
    await this.yesButton.click();
  }

  /** Click the lightbulb without confirming (for the exhausted-hints check). */
  async clickLightbulb(): Promise<void> {
    await expect(this.lightbulbTrigger).toBeVisible();
    await waitUntilStable(this.lightbulbTrigger);
    await this.lightbulbTrigger.click();
  }

  /** Wait until the hint content image has fully loaded. */
  async waitForImageLoad(): Promise<void> {
    await expect(this.hintImage).toHaveJSProperty('complete', true);
    await expect(this.hintImage).not.toHaveJSProperty('naturalWidth', 0);
  }
}
