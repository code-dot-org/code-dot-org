import {type Locator, type Page} from '@playwright/test';

import {waitUntilStable} from '../shared/stability';

/**
 * Callouts: the qTip tooltips the code-studio level chrome renders over a lab
 * from per-level levelbuilder config (apps/src/code-studio/callouts.js), gated
 * by show_callouts=1. They are level chrome shared across labs (StudioApp,
 * AppLab, P5Lab), not a page — so they're modeled as a component lab page
 * objects compose (`lab.callouts`), mirroring AuthoredHintsComponent.
 *
 * Containers (.cdo-qtips) stay in the DOM after dismissal — only their
 * visibility changes. Index is 0-based, matching the source step's nth
 * .cdo-qtips element.
 */
export class CalloutsComponent {
  private readonly page: Page;

  /** All callout containers; the indexed accessors select from this set. */
  private readonly containers: Locator;

  constructor(page: Page) {
    this.page = page;
    this.containers = page.locator('.cdo-qtips');
  }

  /** The nth callout container (0-based). */
  callout(index: number): Locator {
    return this.containers.nth(index);
  }

  /** The close (x) button inside the nth callout. */
  closeButton(index: number): Locator {
    return this.callout(index).locator('.tooltip-x-close');
  }

  /** The qTip wrapper for the nth callout (#qtip-0, ...); carries the z-index. */
  qtip(index: number): Locator {
    return this.page.locator(`#qtip-${index}`);
  }

  /**
   * Dismiss the nth callout via its x-close button. Cucumber: "I close callout N".
   * Settles the button first: qTip repositions the callout as it lays out, and
   * webkit drops a click whose target moves between the actionability check and
   * the press (same guard AuthoredHintsComponent uses).
   */
  async close(index: number): Promise<void> {
    const button = this.closeButton(index);
    await waitUntilStable(button);
    await button.click();
  }
}
