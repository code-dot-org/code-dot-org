// Where an actor is used, for the Actor Palette's Delete to say before it
// acts, and the placements that go with it (specs/SHELL_PLAN.md, step 2).
//
// The same two kinds of reference a rename carries (`renameThing`): a
// placement in a map or screen, which names the actor by module path, and a
// block in some code, which names it by path in a field or by the slug minted
// from that path in its type.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {viewOf} from '../actors/actorData';
import {pathSlug} from '../blockly/domainBlocks';
import {rewriteWorkspace, WORKSPACE_FILE} from '../blockly/rewriteWorkspaces';
import {resolveRuleContents} from '../rules/ruleReference';

import {MEMBER_TYPE, SAYS_WORDS} from './renameThing';

/** A file a map's placements are kept in. */
const PLACES = /\.(map|screen)$/;

interface Placing {
  actors?: Array<{type?: string}>;
}

const parsePlaces = (contents: string | undefined): Placing | undefined => {
  try {
    const parsed = JSON.parse(contents ?? '') as Placing;
    return parsed && typeof parsed === 'object' ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export interface ActorUses {
  /** The maps and screens that place it, by file id. */
  placedIn: string[];
  /** The other files whose code names it, by file id. */
  namedIn: string[];
}

/** Where the actor at module path `path` (`actors/player`) is used. */
export function actorUses(source: MultiFileSource, path: string): ActorUses {
  const slug = pathSlug(path);
  const own = `${path.split('/').pop()}.actor`;
  const placedIn: string[] = [];
  const namedIn: string[] = [];
  for (const [id, file] of Object.entries(source.files)) {
    if (
      PLACES.test(file.name) &&
      parsePlaces(file.contents)?.actors?.some(actor => actor.type === path)
    ) {
      placedIn.push(id);
    }
    if (!WORKSPACE_FILE.test(file.name) || file.name === own) {
      continue;
    }
    let names = false;
    // The rename's walk, asked without rewriting: it reports, and the
    // contents it would write are thrown away.
    rewriteWorkspace(viewOf(resolveRuleContents(file.contents ?? '')), {
      type(type) {
        names ||= MEMBER_TYPE.exec(type)?.[2] === slug;
        return type;
      },
      fields(fields, blockType) {
        if (!blockType || !SAYS_WORDS.has(blockType)) {
          names ||= Object.values(fields).includes(path);
        }
      },
    });
    if (names) {
      namedIn.push(id);
    }
  }
  return {placedIn, namedIn};
}

/**
 * The project with every placement of `path` taken off its maps and
 * screens: a placement of an actor the project no longer holds places
 * nothing, and the map editor would draw it as a hole.
 */
export function withoutPlacementsOf(
  source: MultiFileSource,
  path: string,
): MultiFileSource {
  const files = {...source.files};
  let changed = false;
  for (const [id, file] of Object.entries(source.files)) {
    if (!PLACES.test(file.name)) {
      continue;
    }
    const doc = parsePlaces(file.contents);
    if (!doc?.actors?.some(actor => actor.type === path)) {
      continue;
    }
    doc.actors = doc.actors.filter(actor => actor.type !== path);
    files[id] = {...file, contents: JSON.stringify(doc, null, 2)};
    changed = true;
  }
  return changed ? {...source, files} : source;
}
