// A default shadow for a block's `ACTOR` value input, so an action block reads
// "… of [this actor]" and works with nothing plugged in — dropping another actor
// value (e.g. a `for each` loop's actor variable) into the socket retargets it.
// Attached as a block extension because the simplified toolbox lists blocks by
// type only and can't carry per-input shadow specs.
//
// Two of them, because a socket asking WHICH ACTOR TO ACT ON has a different
// answer on a camera's members:
//
//   - `actorInputExtension` — the ordinary one. Actions, queries, properties:
//     each operates on one live actor, and inside a handler that is the
//     instance the event was delivered to. `this actor` is the answer in every
//     file.
//   - `cameraInputExtension` — the same socket on a member a CAMERA elects,
//     where the only sensible answer is `this camera`.
//
// Whose event a handler is was a third socket, seeded `any <kind>` in a world
// and `this actor` elsewhere. It is words on the event block now, from a
// stored field (`eventSubject`).
//
// "when any Coin is touched → hide THIS ACTOR" is the sentence a learner
// means: the handler is about a kind, and the row inside it about the one
// coin the event happened to. So a row here still defaults to `this actor`.

import type {Block, WorkspaceSvg} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {addOnChange, isStructuralChange} from './extensions/onChange';
import {subjectOfTraitValue} from './traitOptions';
import {definesWorld} from './workspaceRoots';

export const ACTOR_INPUT_EXTENSION = 'world_actor_input';
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
export const subjectShadow = (block: Block): string => {
  if (inCameraBody(block)) {
    return 'world_this_camera';
  }
  // A block that NAMES a trait is a special case, and `add trait ⟨…⟩ to ⟨…⟩`
  // is the one that matters: the trait decides whose it is. A camera trait
  // given to `this actor` is a sentence that reads fine and does nothing, and
  // the fix was to drag `camera ⟨the main camera⟩` in every single time.
  //
  // The main camera rather than `this camera`, because outside a `define
  // camera` body there is no such thing — `this camera` generates the bare
  // identifier `camera`, which a world body does not bind.
  const named = block.getFieldValue?.('TRAIT');
  if (named && subjectOfTraitValue(String(named)) === 'camera') {
    return cameraOutside(block);
  }
  return 'world_this_actor';
};

/**
 * Whose a camera member is, outside a `define camera` body.
 *
 * IN A WORLD FILE, the main camera: `define camera` is for the second camera a
 * world wants, so the common case is a world adjusting the one every world
 * already has, and `this camera` there generates an identifier nothing binds.
 *
 * ANYWHERE ELSE — an actor file, a placement's script — the actor. The only
 * kind offered a camera member there is one that shows a map, whose camera
 * traits are its own (specs/SPACE_CAMERAS_PLAN.md, "simplifying"): `set actor
 * to follow of ⟨this actor⟩` in a Viewport's `on create` is the whole of how a
 * minimap follows the Pilot. Seeded with the world's main camera instead, the
 * block read as a sentence about the wrong camera and did nothing — and the
 * first person to write that row had to know to drop `this actor` over it.
 */
const cameraOutside = (block: Block): string =>
  definesWorld(fileWorkspaceOf(block)) ? 'world_camera' : 'world_this_actor';

/**
 * The workspace a block's FILE is in: a block in the flyout belongs to the
 * flyout's workspace, and the question "is this a world file" is about the
 * one it will land in — the same look-through `seedShadow` makes.
 */
const fileWorkspaceOf = (block: Block): WorkspaceSvg | undefined => {
  const workspace = block.workspace as WorkspaceSvg | undefined;
  return (
    (workspace?.isFlyout ? workspace.targetWorkspace : workspace) ?? undefined
  );
};

/**
 * The subject for a member a CAMERA elects — `set look offset of ⟨…⟩`.
 *
 * Inside `define camera`, the camera being defined. Outside it, whatever
 * `cameraOutside` says: the world's main camera in a world file, the actor
 * itself in an actor's or a placement's.
 */
export const cameraShadow = (block: Block): string =>
  inCameraBody(block) ? 'world_this_camera' : cameraOutside(block);

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
const reseedShadow = (
  block: Block,
  choose: (block: Block) => string = subjectShadow,
): void => {
  const connection = block.getInput('ACTOR')?.connection;
  if (!connection) {
    return;
  }
  const current = connection.targetBlock();
  if (current && !current.isShadow()) {
    return;
  }
  const wanted = choose(block);
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
      seedShadow(this, () => cameraShadow(this));
      // Re-seeded for the reason the actor one is: a block dragged into a
      // `define camera` should read as that camera's, and dragged out again
      // should stop pretending there is one.
      addOnChange(this, function (this: Block, event) {
        if (isStructuralChange(this, event)) {
          reseedShadow(this, cameraShadow);
        }
      });
    },
  },
);
