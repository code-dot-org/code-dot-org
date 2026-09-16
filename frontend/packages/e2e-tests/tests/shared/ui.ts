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

/**
 * Concatenated text of every element a (possibly multi-match) locator
 * resolves to, matching browser_helpers.rb's element_text/element_contains_text
 * (jQuery's $(selector).text() joins all matched nodes before the substring
 * check runs). A plain toContainText on a multi-element locator asserts
 * per-element instead, so use this when a selector is expected to match more
 * than one node.
 */
export async function joinedText(locator: Locator): Promise<string> {
  return (await locator.allTextContents()).join('');
}
