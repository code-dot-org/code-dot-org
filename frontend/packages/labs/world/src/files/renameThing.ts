// Renaming a THING, and moving its file to match.
//
// The menus name a file by what it declares (specs/FILES.md), so "rename" here
// means the actor called "Player", not `player.actor`. Both change: the name
// inside the file, and the file's own stem, because a file whose name has
// nothing to do with the thing in it is the confusion the menus exist to end.
//
// WHAT THAT COSTS is every reference. Nothing in this lab records where a
// reference lives, so a rename has to go and find them:
//
//   a MODULE PATH   `actors/player`, on the fields that place an actor, filter
//                   an event, count a kind, load a map, add an effect. Also in
//                   a `.map`, which is not a workspace and needs its own pass.
//   a FILE NAME     `ball.png`, `coin.mp3` — an asset is named by its file, and
//                   a spritesheet cell carries `#3` on the end of it.
//   a BLOCK TYPE    an actor's own properties and blocks are minted from its
//                   path (`pathSlug`), so `world_get_ActorsPlayer_IdProperty`
//                   becomes `world_get_ActorsHero_IdProperty` and every saved
//                   block holding the old one would be a stand-in.
//   a RULE's NAME   which is a reference in itself, and already has a rename
//                   that carries (`blockly/renameRule`).
//
// TEXT IS LEFT ALONE. The walk touches fields, and a `text` block's field is
// prose: a `log` that says "actors/player" is a sentence about the project, not
// a reference to it.

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {pathSlug} from '../blockly/domainBlocks';
import {renameRuleInSource} from '../blockly/renameRule';
import {mapWorkspaces, rewriteWorkspace} from '../blockly/rewriteWorkspaces';
import {ENTRY_FILE} from '../constants';
import {resolveRuleContents} from '../rules/ruleReference';

import {fileStem, renamed} from './newThing';

/** Blocks whose fields are PROSE, and so are never references. */
const SAYS_WORDS = new Set(['text', 'world_log', 'world_print']);

/** Member block types: `world_get_<owner>_<member>` (`renameRule`). */
const MEMBER_TYPE =
  /^(world_(?:get|set|do|query|on|push|drop))_([A-Za-z0-9]+)_(.+)$/;

/** The extension a file's name ends with, without the dot. */
const extensionOf = (name: string): string => name.split('.').pop() ?? '';

/** A code file is referred to by its module path; an asset by its file name. */
const CODE = /\.(rule|actor|world|map|anim|effect)$/;

/**
 * What this file is called from elsewhere, before and after.
 *
 * Undefined when nothing can refer to it — a file outside any folder has no
 * module path to be named by.
 */
const referencesOf = (
  source: MultiFileSource,
  file: ProjectFile,
  toFileName: string,
): {from: string; to: string} | undefined => {
  if (!CODE.test(file.name)) {
    return {from: file.name, to: toFileName};
  }
  const folder = source.folders[file.folderId]?.name;
  if (!folder) {
    return undefined;
  }
  const stem = (name: string) => name.replace(/\.[^.]+$/, '');
  return {
    from: `${folder}/${stem(file.name)}`,
    to: `${folder}/${stem(toFileName)}`,
  };
};

/**
 * Every reference to `from` rewritten as `to`, across the project.
 *
 * Field values are compared WHOLE — a rename is not a search and replace — with
 * one exception: a spritesheet cell is the file's name with `#3` on the end,
 * and that is still a reference to the file.
 */
export function renameReferences(
  source: MultiFileSource,
  {from, to}: {from: string; to: string},
): MultiFileSource {
  const fromSlug = pathSlug(from);
  const toSlug = pathSlug(to);
  const rewritten = mapWorkspaces(source, contents =>
    rewriteWorkspace(contents, {
      type(type) {
        const parts = MEMBER_TYPE.exec(type);
        return parts && parts[2] === fromSlug
          ? `${parts[1]}_${toSlug}_${parts[3]}`
          : type;
      },
      fields(fields, blockType) {
        if (blockType && SAYS_WORDS.has(blockType)) {
          return;
        }
        for (const [name, value] of Object.entries(fields)) {
          if (value === from) {
            fields[name] = to;
          } else if (
            typeof value === 'string' &&
            value.startsWith(`${from}#`)
          ) {
            // A cell of a spritesheet: `coinSpin.png#3`.
            fields[name] = `${to}#${value.slice(from.length + 1)}`;
          }
        }
      },
    }),
  );
  return renameInMaps(rewritten, from, to);
}

/**
 * …and the same in every `.map`, which is a document rather than a workspace.
 *
 * A placement names the kind it places by module path, so a map is the one
 * other place an actor's path is written down (`mapEditor/mapModel`).
 */
function renameInMaps(
  source: MultiFileSource,
  from: string,
  to: string,
): MultiFileSource {
  const files = {...source.files};
  let changed = false;
  for (const [id, file] of Object.entries(source.files)) {
    if (!file.name.endsWith('.map') || !file.contents?.includes(from)) {
      continue;
    }
    let document: {actors?: Array<{type?: string}>};
    try {
      document = JSON.parse(file.contents) as typeof document;
    } catch {
      continue; // mid-edit: left exactly as it is
    }
    let touched = false;
    for (const placement of document.actors ?? []) {
      if (placement.type === from) {
        placement.type = to;
        touched = true;
      }
    }
    if (touched) {
      files[id] = {...file, contents: `${JSON.stringify(document, null, 2)}\n`};
      changed = true;
    }
  }
  return changed ? {...source, files} : source;
}

/** Why a rename cannot happen, or nothing. */
export type Refusal = string | undefined;

/**
 * Rename the thing this file declares, and move the file to match.
 *
 * THE FILE STAYS PUT for the world the lab runs. `worlds/main.world` is the
 * entry by PATH — the runtime says "No entry file" without it — so that one is
 * renamed inside and left where it is. Everything else moves, and every
 * reference moves with it.
 */
export function renameThing(
  source: MultiFileSource,
  file: ProjectFile,
  name: string,
): {source: MultiFileSource; refusal?: Refusal} {
  const extension = extensionOf(file.name);
  const stem = fileStem(name);
  if (!stem) {
    return {source, refusal: 'A name needs a letter or a number in it.'};
  }
  const entry =
    `${source.folders[file.folderId]?.name}/${file.name}` === ENTRY_FILE;
  const toFileName = entry ? file.name : `${stem}.${extension}`;

  const clash = Object.values(source.files).find(
    other =>
      other.id !== file.id &&
      other.folderId === file.folderId &&
      other.name === toFileName,
  );
  if (clash) {
    return {
      source,
      refusal: `There is already a file called ${toFileName} here.`,
    };
  }

  // A rule's NAME is itself a reference — to its traits, its members and the
  // worlds that use it — and carrying that is a transform of its own.
  const wasRule = file.name.endsWith('.rule');
  // Resolved, because a rule the learner has not edited holds a REFERENCE to
  // the library's and declares nothing of its own (rules/ruleReference).
  // Unresolved, `wasCalled` came back undefined for exactly those rules, the
  // rename below was skipped, and renaming an unedited rule left every
  // reference to it in the project pointing at the old name.
  const own = resolveRuleContents(file.contents ?? '');
  const wasCalled = declaredName(own);
  let next =
    wasRule && wasCalled && wasCalled !== name
      ? renameRuleInSource(source, wasCalled, name)
      : source;

  // The declaration itself, in the file being renamed. `renameRuleInSource`
  // rewrites a `define rule`'s NAME as it goes; this is what covers everything
  // else, a `define behavior` included.
  const current = next.files[file.id] ?? file;
  // …and resolved again: `renameRuleInSource` materializes the reference on
  // its way through, but it does not run when the declared name is already
  // the new one, and there would be nothing here to rewrite.
  const contents = renamed(resolveRuleContents(current.contents ?? ''), name);

  next = {
    ...next,
    files: {...next.files, [file.id]: {...current, name: toFileName, contents}},
  };

  if (toFileName !== file.name) {
    const references = referencesOf(source, file, toFileName);
    if (references) {
      next = renameReferences(next, references);
    }
  }
  return {source: next};
}

/** What a file currently calls itself, for the rename to carry. */
function declaredName(contents: string): string | undefined {
  const trimmed = contents.trim();
  if (!trimmed.startsWith('{')) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(trimmed) as {
      blocks?: {blocks?: Array<{fields?: {NAME?: string}}>};
      name?: unknown;
    };
    const root = parsed.blocks?.blocks?.find(
      block => block?.fields?.NAME !== undefined,
    );
    return (
      root?.fields?.NAME ??
      (typeof parsed.name === 'string' ? parsed.name : undefined)
    );
  } catch {
    return undefined;
  }
}
