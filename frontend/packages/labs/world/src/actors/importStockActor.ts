// Copying a stock actor into the learner's project.
//
// `importStockRule`'s sibling, a pure transform of the project source, and it
// makes the same promise: nothing is ever overwritten. An actor is where a
// learner's own edits live, and a second import that silently replaced the
// first would take work with it and give no sign.
//
// EVERYTHING THE FILE NAMES COMES WITH IT, which is the whole of what this
// adds over writing the file yourself. An actor's rows are references — to a
// trait, to an animation, to an image — and every one of them is a field whose
// value must be among options the PROJECT supplies. A row naming something the
// project lacks does not announce itself: a missing trait fails at compile time
// with nothing on screen to say why, and a missing animation resolves to
// whatever else is in the dropdown.
//
// So an import is an aggregate. A Coin asks for ONE rule and ONE animation and
// writes seven files: Collection, the Collisions it requires, the Motion that
// requires, the `.anim`, the strip its frames read, that strip's `.sheet`, and
// the actor. Nothing here counts to seven — each of the three importers this
// calls walks its own dependencies and is a pure never-overwrite transform, so
// they compose without any of them knowing about the others.

import {createNewFolder, getNextFileId} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  importStockAnimation,
  importStockSprite,
} from '../appearance/importStock';
import {
  STOCK_ANIMATIONS,
  STOCK_SPRITES,
  type StockAnimation,
  type StockSprite,
} from '../appearance/stock';
import {importStockRule} from '../rules/importStockRule';
import {stockRuleByName, type StockRule} from '../rules/stock';

import {stockActorById, type StockActor} from './stock';

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
 * The stock actors this one acts LIKE, in the order they are named.
 *
 * Exported beside `actorRequirements` and for the same reason: the dialog says
 * what an import will write before it writes it.
 */
export function actorParents(actor: StockActor): StockActor[] {
  return (actor.actors ?? [])
    .map(id => stockActorById(id))
    .filter((one): one is StockActor => one !== undefined);
}

/** The stock animations an actor brings with it. For the dialog, as above. */
export function actorAnimations(actor: StockActor): StockAnimation[] {
  return (actor.animations ?? [])
    .map(id => STOCK_ANIMATIONS.find(entry => entry.id === id))
    .filter((entry): entry is StockAnimation => entry !== undefined);
}

/**
 * The stock sprites an actor brings with it — the ones it names DIRECTLY.
 *
 * Not the strips its animations read. Those arrive too, but through
 * `importStockAnimation`, and naming them here would say a Coin adds two
 * pictures when what it adds is one animation.
 */
export function actorSprites(actor: StockActor): StockSprite[] {
  return (actor.sprites ?? [])
    .map(id => STOCK_SPRITES.find(entry => entry.id === id))
    .filter((entry): entry is StockSprite => entry !== undefined);
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
 * Copy a stock actor into the project, with everything its rows name.
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
  return writeActor(source, actor, new Set());
}

/**
 * …and the walk itself, which an actor's parents make recursive.
 *
 * `seen` is by id and guards the walk rather than the writing:
 * `alreadyImported` stops a file being written twice, but it is asked AFTER
 * the dependencies are, so a ring of actors acting like each other would
 * recurse forever before either of them noticed. The editor will not let one
 * be built (`moduleOptions.actorParentOptions`) and the shelf is ours, so this
 * is the belt: a walk that ends is worth more than a walk that is provably
 * unnecessary.
 */
function writeActor(
  source: MultiFileSource,
  actor: StockActor,
  seen: Set<string>,
): ImportedActor {
  let current = source;
  if (seen.has(actor.id)) {
    return {source: current, path: `${ACTORS_FOLDER}/${actor.id}`};
  }
  seen.add(actor.id);
  // The kind it acts LIKE, first: `acts like` names a module path, and a path
  // naming a file the project lacks inherits nothing at all — no traits, no
  // picture, no per-frame work — and says so nowhere.
  for (const parent of actorParents(actor)) {
    current = writeActor(current, parent, seen).source;
  }
  for (const rule of actorRequirements(actor)) {
    current = importStockRule(current, rule).source;
  }
  for (const sprite of actorSprites(actor)) {
    current = importStockSprite(current, sprite).source;
  }
  for (const animation of actorAnimations(actor)) {
    current = importStockAnimation(current, animation).source;
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
