import AxeBuilder from '@axe-core/playwright';
import {expect, type Page} from '@playwright/test';

/**
 * WCAG levels we scan against: 2.0 / 2.1 / 2.2 at A and AA. AA is the floor, not
 * the target — see the accessibility skill.
 */
export const WCAG_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
];

/** Sorted axe rule IDs from a scan result — the unit we baseline against. */
export const violationIds = (results: {violations: {id: string}[]}): string[] =>
  results.violations.map(v => v.id).sort();

interface BaselineOptions {
  /**
   * CSS selector to scope the scan to (axe `.include`). Use when a page-level
   * scan is noisy — e.g. a modal over a background that re-renders.
   */
  selector?: string;
}

/**
 * Scan the current page state with axe-core and assert its violations match the
 * known baseline exactly. New violations fail; fixing one means dropping its id
 * from `baseline` so the test stays honest. Suppression lives ONLY in this list
 * — never by disabling a rule.
 */
export async function expectBaselineViolations(
  page: Page,
  baseline: string[],
  options: BaselineOptions = {},
): Promise<void> {
  let builder = new AxeBuilder({page}).withTags(WCAG_TAGS);
  if (options.selector) {
    builder = builder.include(options.selector);
  }
  const results = await builder.analyze();
  expect(violationIds(results)).toEqual([...baseline].sort());
}
