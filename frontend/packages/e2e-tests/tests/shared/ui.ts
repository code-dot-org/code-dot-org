import {type Locator} from '@playwright/test';

/**
 * Computed z-index of a locator's element, with the CSS keyword 'auto' (and any
 * non-numeric value) resolving to 0 — matching the source step, which read the
 * CSS z-index where Ruby's String#to_i maps the keyword 'auto' to 0.
 */
export async function computedZIndex(locator: Locator): Promise<number> {
  return locator.evaluate(
    el => Number.parseInt(window.getComputedStyle(el).zIndex, 10) || 0,
  );
}
