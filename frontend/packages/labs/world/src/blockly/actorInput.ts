// A default shadow for a block's `ACTOR` value input, so an action block reads
// "… of [this actor]" and works with nothing plugged in — dropping another actor
// value (e.g. a `for each` loop's actor variable) into the socket retargets it.
// Attached as a block extension because the simplified toolbox lists blocks by
// type only and can't carry per-input shadow specs.
//
// Three of them, because a socket asking WHOSE HANDLER THIS IS is a different
// question from one asking WHICH ACTOR TO ACT ON, and a camera's members are
// asking about neither:
//
//   - `actorInputExtension` — the ordinary one. Actions, queries, properties:
//     each operates on one live actor, and inside a handler that is the
//     instance the event was delivered to. `this actor` is the answer in every
//     file.
//   - `cameraInputExtension` — the same socket on a member a CAMERA elects,
//     where the only sensible answer is `this camera`.
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

import {addOnChange, isStructuralChange} from './extensions/onChange';
import {definesWorld} from './localActors';

export const ACTOR_INPUT_EXTENSION = 'world_actor_input';
export const ACTOR_SUBJECT_EXTENSION = 'world_actor_subject_input';
export const CAMERA_INPUT_EXTENSION = 'world_camera_input';

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

/**
 * Whether this block sits inside a `define camera` body.
 *
 * `getSurroundParent`, because `define camera` HAS a `do` mouth — the reason
 * `layerOf` gives for the same choice. A block merely chained below the camera
 * is beside it, not in it.
 *
 * A handler ends the walk: it rebinds the subject, so a block inside one is not
 * the camera's however far up the camera is.
 */
export const inCameraBody = (block: Block): boolean => {
  for (
    let parent = block.getSurroundParent?.() ?? null;
    parent;
    parent = parent.getSurroundParent?.() ?? null
  ) {
    if (parent.type === 'world_define_camera') {
      return true;
    }
    if (parent.type.startsWith('world_on_')) {
      return false;
    }
  }
  return false;
};

/**
 * The subject a block in this position is about.
 *
 * Inside `define camera` that is the camera — `this camera` outputs `Actor`, so
 * it fits the same socket, and a camera has the foundation's traits (a position,
 * a rotation) that these blocks read. Everywhere else it is the actor.
 */
export const subjectShadow = (block: Block): string =>
  inCameraBody(block) ? 'world_this_camera' : 'world_this_actor';

/**
 * Replace the shadow when the block's surroundings change its subject.
 *
 * Seeding at creation was not enough, and the gap was visible: a block dragged
 * INTO a `define camera` kept the `this actor` it was made with, so it read as
 * being about an actor that is not there, and a learner had to know to swap in
 * `this camera` by hand. Dragging back out has the same problem in reverse.
 *
 * ONLY A SHADOW IS OURS TO CHANGE. A block the learner dropped into the socket
 * is an answer they gave; replacing it because they moved the whole thing would
 * be editing their program. `isShadow` is the whole test — a real block sits in
 * front of the shadow, and finding one means the question was already answered.
 */
const reseedShadow = (block: Block): void => {
  const connection = block.getInput('ACTOR')?.connection;
  if (!connection) {
    return;
  }
  const current = connection.targetBlock();
  if (current && !current.isShadow()) {
    return;
  }
  const wanted = subjectShadow(block);
  // Already right: setting it again would discard a shadow's own state (an
  // `any ⟨kind⟩` shadow remembers which kind) for no change.
  if (current?.type === wanted) {
    return;
  }
  connection.setShadowState({type: wanted});
};

/** Give this block's `ACTOR` value input a default subject shadow. */
export const actorInputExtension: Extension = defineExtension(
  ACTOR_INPUT_EXTENSION,
  {
    extension() {
      seedShadow(this, () => subjectShadow(this));
      addOnChange(this, function (this: Block, event) {
        if (isStructuralChange(this, event)) {
          reseedShadow(this);
        }
      });
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

/**
 * The same for a member declared on a trait a CAMERA elects.
 *
 * `set look offset of ⟨…⟩` belongs to a camera, so the answer to "whose?" is
 * `this camera` and never `this actor`. Seeded with the wrong one it read as a
 * sentence about an actor and generated `actor`, which a `define camera` body
 * does not bind — so it had to be thrown away and replaced by hand every time.
 *
 * Chosen from the member's SCOPE, which is a fact about where it was declared
 * (`MemberScope`) and so is known when the block is defined. Being inside a
 * `define camera` is not: an extension runs as the block is created, and a
 * block in a flyout has not landed anywhere yet. That is why the ordinary
 * engine blocks — `set position of ⟨this actor⟩` and the rest — still seed an
 * actor wherever they are dragged.
 */
export const cameraInputExtension: Extension = defineExtension(
  CAMERA_INPUT_EXTENSION,
  {
    extension() {
      seedShadow(this, () => 'world_this_camera');
    },
  },
);
