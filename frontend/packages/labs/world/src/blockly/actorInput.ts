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
 * The subject a block in this position is about: the actor, unless the block
 * names a camera trait.
 */
export const subjectShadow = (block: Block): string => {
  // A block that NAMES a trait is a special case, and `add trait ⟨…⟩ to ⟨…⟩`
  // is the one that matters: the trait decides whose it is. A camera trait
  // given to `this actor` is a sentence that reads fine and does nothing.
  //
  // `camera of ⟨…⟩` rather than `this camera`, because `this camera`
  // generates the bare identifier `camera`, which nothing outside a camera's
  // own step binds.
  const named = block.getFieldValue?.('TRAIT');
  if (named && subjectOfTraitValue(String(named)) === 'camera') {
    return cameraShadow();
  }
  return 'world_this_actor';
};

/**
 * The subject for a member a CAMERA elects — `set look offset of ⟨…⟩` —
 * outside a camera's own step: `camera of ⟨this actor⟩`, which in a Viewport's
 * own placement code is that Viewport's (specs/ONE_WORLD_PLAN.md).
 */
export const cameraShadow = (): string => 'world_camera_of';

/**
 * Replace the shadow when the block's surroundings change its subject.
 *
 * Seeding at creation was not enough: `add trait ⟨…⟩ to ⟨…⟩` is made before its
 * trait is chosen, and choosing a camera trait changes whose it is.
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
 * sentence about an actor in a world file, where there is none.
 *
 * Chosen from the member's SCOPE, which is a fact about where it was declared
 * (`MemberScope`) and so is known when the block is defined.
 */
export const cameraInputExtension: Extension = defineExtension(
  CAMERA_INPUT_EXTENSION,
  {
    extension() {
      seedShadow(this, cameraShadow);
      // A block made in the flyout is seeded for the flyout's file.
      addOnChange(this, function (this: Block, event) {
        if (isStructuralChange(this, event)) {
          reseedShadow(this, cameraShadow);
        }
      });
    },
  },
);
