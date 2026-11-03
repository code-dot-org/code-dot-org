// The tweens a project's actors hold, and how a block names one
// (specs/TWEENS_AS_DATA_PLAN.md).
//
// A `play tween` stores its tween's actor and id, `actors/pad#fade-out`: the
// id outlives a rename, two tweens both called "fade" stay told apart, and a
// renamed actor file carries the path (`renameReferences`).

import type {Blockly} from '@code-dot-org/blockly';

import {editingActorModule} from './editingRule';
import {liveDropdown} from './moduleOptions';
import {TWEEN_HEAD} from './pageHeads';

/**
 * The block that plays a tween with no name, described where it is used.
 *
 * Its mouth holds the same rows a definition's does, so the setter generators
 * have to recognise BOTH: what makes a `set` block a destination is being
 * inside a tween, and there are two blocks that are one.
 */
export const PLAY_TWEEN_HERE = 'world_play_tween_here';

/** How a tween moves between its ends, as its dropdown offers them. */
export const CURVE_OPTIONS: Array<[string, string]> = [
  ['steadily', 'linear'],
  ['starting slowly', 'ease-in'],
  ['ending slowly', 'ease-out'],
  ['slow at both ends', 'ease-in-out'],
];

/**
 * The name an actor's tween is exported under: from its id, which outlives
 * a rename, so every module that imports it still finds it.
 */
export const tweenExport = (id: string): string =>
  `${id
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')}Tween`;

/** A tween an actor of the project holds, as `play tween` offers it. */
export interface ProjectTween {
  /** The actor's module path. */
  module: string;
  id: string;
  name: string;
  /** What the actor is called. */
  actor: string;
}

let projectTweens: readonly ProjectTween[] = [];

/** Replace the project's tweens (`refreshProjectDropdowns`). */
export function setProjectTweens(tweens: readonly ProjectTween[]): void {
  projectTweens = tweens;
}

/** What `play tween` stores for a tween: its actor's path and its id. */
export const tweenValue = (module: string, id: string): string =>
  `${module}#${id}`;

/** The project's tween a `play tween` value names, if it still holds one. */
export const projectTween = (value: string): ProjectTween | undefined =>
  projectTweens.find(one => tweenValue(one.module, one.id) === value);

/**
 * The rows a TWEEN dropdown offers: the tweens of the actor whose file it is
 * in, by name, then every other actor's, by actor and name.
 *
 * A dropdown with no options cannot be built, so a project with none says so
 * in words, and `play tween` then generates nothing.
 */
export const tweenOptions = (
  field?: Blockly.Field,
): Array<[string, string]> => {
  const own = editingActorModule(field?.getSourceBlock() ?? undefined);
  const row = (one: ProjectTween): [string, string] => [
    one.module === own ? one.name : `${one.actor}: ${one.name}`,
    tweenValue(one.module, one.id),
  ];
  const rows = [
    ...projectTweens.filter(one => one.module === own),
    ...projectTweens.filter(one => one.module !== own),
  ].map(row);
  return rows.length ? rows : [['(no tweens yet)', '']];
};

/** Keep a TWEEN dropdown showing the tweens the project's actors hold. */
export const tweenOptionsExtension = liveDropdown(
  'world_tween_options',
  'TWEEN',
  tweenOptions,
);

/**
 * Whether this block is a tween's destination: below a tween's head on its
 * page, or in the mouth of `play a tween on`.
 *
 * `getSurroundParent` for the mouth, which is a statement input: a block
 * chained below `play a tween on` is beside it, not in it.
 *
 * A handler ends it: inside a handler the subject is rebound and the block is
 * about a moment rather than about a destination.
 */
export const inTweenBody = (block: Blockly.Block): boolean => {
  // On a tween's page the destinations hang below its head, and nothing
  // else is written there.
  if (block.getRootBlock?.()?.type === TWEEN_HEAD) {
    return true;
  }
  for (
    let parent = block.getSurroundParent?.() ?? null;
    parent;
    parent = parent.getSurroundParent?.() ?? null
  ) {
    if (parent.type === PLAY_TWEEN_HERE) {
      return true;
    }
    if (parent.type.startsWith('world_on_')) {
      return false;
    }
  }
  return false;
};

/**
 * One row of a tween's mouth, as generated code.
 *
 * An ordinary `set` block generates a WRITE; inside a tween the same block
 * names a DESTINATION instead. Reusing the blocks rather than inventing a
 * `move ⟨property⟩ to ⟨value⟩` is what keeps the tween's vocabulary exactly
 * the vocabulary of properties — every rule's, every actor's own, and the
 * foundation's — with nothing to keep in step.
 *
 * `from` is not here. It is read when the tween is PLAYED, because a
 * destination is a fact about where to go and not about where you were.
 */
export const tweenStepCode = (property: string, to: string): string =>
  `{property: ${property}, to: ${to}},\n`;
