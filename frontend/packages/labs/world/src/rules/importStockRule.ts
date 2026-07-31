// Copying a stock rule into the learner's project.
//
// A pure transform of the project source, for the same reason `importStockEffect`
// is one: the interesting parts are naming and placement, and both are far
// easier to get right — and keep right — tested without a React tree or a
// Blockly workspace.
//
// The one thing this must never do is overwrite. A rule is where a learner's
// mechanics live; importing "Has Gravity" a second time and silently discarding
// the first copy would take work with it and give no sign.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import type {StockRule} from './stock';

/** Where rules live, by the lab's directory convention (GLOSSARY.md). */
const RULES_FOLDER = 'rules';

/** The result of an import: the new project, and what to call the rule. */
export interface ImportedRule {
  source: MultiFileSource;
  /**
   * The extension-less module path — `rules/gravity` — which is what a `use
   * rule` field stores, what the generated world imports, and what every
   * reference to the rule's members is built from.
   */
  path: string;
}

/** The `rules/` folder id, creating the folder if the project lacks one. */
function rulesFolder(source: MultiFileSource): {
  source: MultiFileSource;
  folderId: string;
} {
  const existing = Object.values(source.folders).find(
    folder => folder.name === RULES_FOLDER && folder.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  const next = createNewFolder(source, RULES_FOLDER);
  const created = Object.values(next.folders).find(
    folder => folder.name === RULES_FOLDER && folder.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

/**
 * A file stem not already taken in `rules/`.
 *
 * Counts `.rule` files AND anything else with the stem: a project may hold a
 * `gravity.js` shim from before rules were authorable, and two modules that
 * differ only by extension would make `rules/gravity` ambiguous to the
 * compiler's extension search (virtualFsPlugin's EXT_ORDER).
 */
function freeStem(
  source: MultiFileSource,
  folderId: string,
  wanted: string,
): string {
  const taken = new Set(
    Object.values(source.files)
      .filter(file => file.folderId === folderId)
      .map(file => file.name.replace(/\.[^.]+$/, '')),
  );
  if (!taken.has(wanted)) {
    return wanted;
  }
  for (let suffix = 2; ; suffix++) {
    const candidate = `${wanted}-${suffix}`;
    if (!taken.has(candidate)) {
      return candidate;
    }
  }
}

/**
 * Copy a stock rule into the project.
 *
 * The file is added but NOT made the active tab — an import is started from a
 * `use rule` dropdown, and the point is to get back to that block with the rule
 * selected. Opening the rule's workspace instead would leave the learner
 * looking at somebody else's mechanics while the change they asked for happened
 * off screen. (Same reasoning, same shape, as `importStockEffect`.)
 */
export function importStockRule(
  source: MultiFileSource,
  rule: StockRule,
): ImportedRule {
  const placed = rulesFolder(source);
  const stem = freeStem(placed.source, placed.folderId, rule.id);
  const fileId = getNextFileId(Object.values(placed.source.files));

  return {
    source: {
      ...placed.source,
      files: {
        ...placed.source.files,
        [fileId]: {
          id: fileId,
          name: `${stem}.rule`,
          language: 'rule',
          contents: rule.contents,
          folderId: placed.folderId,
        },
      },
    },
    path: `${RULES_FOLDER}/${stem}`,
  };
}
