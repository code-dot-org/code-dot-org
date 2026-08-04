// A default shadow for a block's `ACTOR` value input, so an action block reads
// "… of [this actor]" and works with nothing plugged in — dropping another actor
// value (e.g. a `for each` loop's actor variable) into the socket retargets it.
// Attached as a block extension because the simplified toolbox lists blocks by
// type only and can't carry per-input shadow specs.
//
// Two of them, because a socket asking WHOSE HANDLER THIS IS is a different
// question from one asking WHICH ACTOR TO ACT ON:
//
//   - `actorInputExtension` — the ordinary one. Actions, queries, properties:
//     each operates on one live actor, and inside a handler that is the
//     instance the event was delivered to. `this actor` is the answer in every
//     file.
//   - `actorSubjectExtension` — an event hat's socket, and only that. A
//     `.world` file has no principal actor (`actor` is not bound at its top
//     level at all), so a hat there defaults to `any <kind>`: registering on
//     the template is what makes one handler reach every actor of that kind,
//     the ones the map placed and the ones added later. An `.actor` file is
//     about one actor, so there the subject is `this actor` like everything
//     else.
//
// The split is the point. "when any Coin is touched → hide THIS ACTOR" is the
// sentence a learner means; defaulting the inner block to the kind would read
// as hiding every coin at once.

import type {Block, WorkspaceSvg} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {definesWorld} from './localActors';

export const ACTOR_INPUT_EXTENSION = 'world_actor_input';
export const ACTOR_SUBJECT_EXTENSION = 'world_actor_subject_input';

/** Seed an empty `ACTOR` input with the shadow `choose` names. */
const seedShadow = (
  block: Block,
  choose: (workspace: WorkspaceSvg | undefined) => string,
): void => {
  const connection = block.getInput('ACTOR')?.connection;
  // Only seed the shadow on a fresh block; a saved/real block keeps its own.
  if (!connection || connection.targetBlock()) {
    return;
  }
  // A block in a flyout is a preview of one you might drag out, so the question
  // is asked of the workspace it would land in.
  const workspace = block.workspace as WorkspaceSvg;
  const target =
    (workspace?.isFlyout ? workspace.targetWorkspace : workspace) ?? undefined;
  connection.setShadowState({type: choose(target)});
};

/** Give this block's `ACTOR` value input a default `world_this_actor` shadow. */
export const actorInputExtension: Extension = defineExtension(
  ACTOR_INPUT_EXTENSION,
  {
    extension() {
      seedShadow(this, () => 'world_this_actor');
    },
  },
);

/**
 * The same for the socket that names an event handler's SUBJECT: `any <kind>`
 * in a world file, `this actor` in an actor file.
 */
export const actorSubjectExtension: Extension = defineExtension(
  ACTOR_SUBJECT_EXTENSION,
  {
    extension() {
      seedShadow(this, workspace =>
        definesWorld(workspace) ? 'world_actor_kind' : 'world_this_actor',
      );
    },
  },
);
