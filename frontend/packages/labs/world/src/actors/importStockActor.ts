// Copying a stock actor into the learner's project.
//
// `importStockRule`'s sibling, a pure transform of the project source, and it
// makes the same promise: nothing is ever overwritten. An actor is where a
// learner's own edits live, and a second import that silently replaced the
// first would take work with it and give no sign.
//
// THE RULES COME WITH IT, for the reason the rule importer's dependencies do. A
// Label elects `Shows Text`; without the Text rule that row names a trait the
// project does not have, which fails at compile time with nothing on screen to
// say why. `importStockRule` then brings each rule's own dependencies, so this
// asks for two and may write four.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {importStockRule} from '../rules/importStockRule';
import {stockRuleByName, type StockRule} from '../rules/stock';

import type {StockActor} from './stock';

/** Where actors live, by the lab's directory convention (GLOSSARY.md). */
const ACTORS_FOLDER = 'actors';

/** The result of an import: the new project, and what to call the actor. */
export interface ImportedActor {
  source: MultiFileSource;
  /**
   * The extension-less module path the actor was written to — `actors/label`.
   * What an ACTOR dropdown stores, and what a generated world imports.
   */
  path: string;
}

/** The `actors/` folder id, creating the folder if the project lacks one. */
function actorsFolder(source: MultiFileSource): {
  source: MultiFileSource;
  folderId: string;
} {
  const existing = Object.values(source.folders).find(
    folder => folder.name === ACTORS_FOLDER && folder.parentId === '0',
  );
  if (existing) {
    return {source, folderId: existing.id};
  }
  const next = createNewFolder(source, ACTORS_FOLDER);
  const created = Object.values(next.folders).find(
    folder => folder.name === ACTORS_FOLDER && folder.parentId === '0',
  );
  return {source: next, folderId: created?.id ?? '0'};
}

/**
 * The stock rules an actor brings with it, in the order they are written.
 * Exported for the import dialog, which says so before you pick.
 */
export function actorRequirements(actor: StockActor): StockRule[] {
  return actor.requires
    .map(name => stockRuleByName(name))
    .filter((rule): rule is StockRule => rule !== undefined);
}

/**
 * Whether `actors/<stem>` already resolves to something in the project.
 *
 * Any extension counts, as it does for a rule: the compiler's extension search
 * would pick one of them, so something already there is what the path means.
 */
function alreadyImported(source: MultiFileSource, stem: string): boolean {
  const folder = Object.values(source.folders).find(
    f => f.name === ACTORS_FOLDER && f.parentId === '0',
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
 * Copy a stock actor into the project, with the rules it elects traits from.
 *
 * The file is added but NOT made the active tab, for the reason the rule
 * importer gives: an import is started from a dropdown, and the point is to get
 * back to that block with the actor selected. Opening the actor's workspace
 * would leave the learner looking at a file while the change they asked for
 * happened off screen.
 */
export function importStockActor(
  source: MultiFileSource,
  actor: StockActor,
): ImportedActor {
  let current = source;
  for (const rule of actorRequirements(actor)) {
    current = importStockRule(current, rule).source;
  }

  const placed = actorsFolder(current);
  current = placed.source;
  const path = `${ACTORS_FOLDER}/${actor.id}`;
  if (alreadyImported(current, actor.id)) {
    return {source: current, path};
  }
  const fileId = getNextFileId(Object.values(current.files));
  return {
    source: {
      ...current,
      files: {
        ...current.files,
        [fileId]: {
          id: fileId,
          name: `${actor.id}.actor`,
          language: 'actor',
          contents: actor.contents,
          folderId: placed.folderId,
        },
      },
    },
    path,
  };
}
