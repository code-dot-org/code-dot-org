import AxeBuilder from '@axe-core/playwright';
import {type Page} from '@playwright/test';

import {settle} from './stability';

export const WCAG_AA_TAGS = [
  'wcag2a',
  'wcag2aa',
  'wcag21a',
  'wcag21aa',
  'wcag22aa',
];

// target-size flakes on font-metric/DPR differences across environments.
const DISABLED_RULES = ['target-size'];

interface ScanOptions {
  /** Scope to a selector; omit to scan the whole page. */
  include?: string;
  /**
   * Drop a subtree from the scan. A string[] is a frame-selector chain, where
   * every entry but the last names a frame: ['#video', '*'] excludes what is
   * inside the #video iframe while keeping the iframe element itself in scope.
   * Use it to keep third-party frame content out of a baseline — we cannot fix
   * those violations and their markup changes without notice.
   */
  exclude?: string | string[];
  /** Omit for axe defaults, which include best-practice rules. */
  tags?: string[];
}

/**
 * Returns a map of violation rule id to failing node count. settle() runs first
 * so counts are read after the page stops changing. Prefer `include`: an
 * unscoped scan covers shared chrome (header/footer) unrelated to the feature.
 */
export async function analyze(
  page: Page,
  {include, exclude, tags}: ScanOptions = {},
): Promise<Record<string, number>> {
  await settle(page);
  let builder = new AxeBuilder({page}).disableRules(DISABLED_RULES);
  if (include) {
    builder = builder.include(include);
  }
  if (exclude) {
    builder = builder.exclude(exclude);
  }
  if (tags) {
    builder = builder.withTags(tags);
  }
  const results = await builder.analyze();
  return Object.fromEntries(
    results.violations.map(v => [v.id, v.nodes.length]),
  );
}
