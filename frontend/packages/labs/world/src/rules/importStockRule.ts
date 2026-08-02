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

import {parseRuleMeta} from '../blockly/ruleMeta';

import {stockRule, type StockRule} from './stock';

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
 * Every stock rule an import will bring along, transitively, in the order they
 * are written. Exported for the import dialog, which says so before you pick.
 */
export function stockRequirements(rule: StockRule): StockRule[] {
  const found: StockRule[] = [];
  const seen = new Set([rule.id]);
  const walk = (of: StockRule): void => {
    for (const dep of stockDependencies(of)) {
      if (seen.has(dep.id)) {
        continue;
      }
      seen.add(dep.id);
      walk(dep);
      found.push(dep);
    }
  };
  walk(rule);
  return found;
}

/**
 * Whether `rules/<stem>` already resolves to something in the project.
 *
 * ANY extension counts, as it did when this decided whether to rename: a
 * `gravity.js` shim and a `gravity.rule` both answer to `rules/gravity`, and the
 * compiler's extension search would pick one of them. If something is already
 * there, that is what `use rule rules/gravity` means, and writing another file
 * beside it would only make which one ambiguous.
 */
function alreadyImported(source: MultiFileSource, modulePath: string): boolean {
  const stem = modulePath.slice(`${RULES_FOLDER}/`.length);
  const folder = Object.values(source.folders).find(
    f => f.name === RULES_FOLDER && f.parentId === '0',
  );
  return (
    !!folder &&
    Object.values(source.files).some(
      file =>
        file.folderId === folder.id &&
        file.name.replace(/\.[^.]+$/, '') === stem,
    )
  );
}

/**
 * The stock rules a rule needs, by module path — its `use rule` dependencies
 * that name a project module rather than a built-in.
 *
 * A rule's requirements are part of the rule: gravity is written against
 * collision's traits and motion's step, and importing it without them leaves
 * `use rule rules/collision` pointing at a file that is not there. The paths are
 * literal, because that is how the workspace refers to them.
 */
export function stockDependencies(rule: StockRule): StockRule[] {
  const meta = parseRuleMeta(`${RULES_FOLDER}/${rule.id}`, rule.contents);
  return (meta?.requires ?? [])
    .filter(dep => dep.startsWith(`${RULES_FOLDER}/`))
    .map(dep => stockRule(dep.slice(`${RULES_FOLDER}/`.length)))
    .filter((dep): dep is StockRule => dep !== undefined);
}

/** Write one rule's file into `rules/`, under `stem`. */
function writeRule(
  source: MultiFileSource,
  folderId: string,
  stem: string,
  rule: StockRule,
): MultiFileSource {
  // `getNextFileId` is max-numeric-id + 1, which is NaN when a project holds an
  // id that is not a number — and NaN twice running means the second file
  // silently replaces the first. An import writes several files at once, so it
  // is the first caller for which that matters.
  let fileId = getNextFileId(Object.values(source.files));
  for (let n = 1; !fileId || fileId === 'NaN' || source.files[fileId]; n++) {
    fileId = `rule-${stem}-${n}`;
  }
  return {
    ...source,
    files: {
      ...source.files,
      [fileId]: {
        id: fileId,
        name: `${stem}.rule`,
        language: 'rule',
        contents: rule.contents,
        folderId,
      },
    },
  };
}

/**
 * Copy a stock rule into the project, with the rules it needs.
 *
 * The file is added but NOT made the active tab — an import is started from a
 * `use rule` dropdown, and the point is to get back to that block with the rule
 * selected. Opening the rule's workspace instead would leave the learner
 * looking at somebody else's mechanics while the change they asked for happened
 * off screen. (Same reasoning, same shape, as `importStockEffect`.)
 *
 * DEPENDENCIES COME WITH IT. Every mechanic is a `.rule` now, and they are
 * written against each other — gravity against collision's traits and motion's
 * step, collision against motion's. Importing one alone used to leave a `use
 * rule` naming a file the project did not have, which fails at compile time with
 * nothing on screen to explain it.
 *
 * NOTHING IS EVER RENAMED, and nothing already there is overwritten. A rule's
 * workspace names ITSELF by module path — its own traits and events in `use
 * trait` and `emit`, and the very block types of its members
 * (`world_get_rules_gravity_FallingProperty`) — so a copy saved as
 * `gravity-2.rule` generates a module that imports its own exports:
 *
 *   The symbol "AffectedByGravityTrait" has already been declared
 *
 * and whose blocks quietly read the other rule's properties. Importing a rule
 * the project already has is therefore a no-op that hands back the path it is
 * already at, which is also what makes importing gravity twice harmless — and
 * leaves a learner's edited copy alone, which is the failure that would matter
 * most.
 */
export function importStockRule(
  source: MultiFileSource,
  rule: StockRule,
): ImportedRule {
  const placed = rulesFolder(source);
  let current = placed.source;
  const folderId = placed.folderId;

  const importDependencies = (of: StockRule, seen: Set<string>): void => {
    for (const dep of stockDependencies(of)) {
      const path = `${RULES_FOLDER}/${dep.id}`;
      if (seen.has(dep.id) || alreadyImported(current, path)) {
        continue;
      }
      seen.add(dep.id);
      // Depth first: a dependency's own dependencies land before it does.
      importDependencies(dep, seen);
      current = writeRule(current, folderId, dep.id, dep);
    }
  };
  importDependencies(rule, new Set([rule.id]));

  const path = `${RULES_FOLDER}/${rule.id}`;
  return {
    source: alreadyImported(current, path)
      ? current
      : writeRule(current, folderId, rule.id, rule),
    path,
  };
}
