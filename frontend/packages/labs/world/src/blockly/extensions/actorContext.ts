// Warnings for blocks placed where the object they call is the wrong one.
//
// `define actor` builds an `ActorBuilder`, while an event handler rebinds the
// same name: `world_on_*` generates `(world, actor, eventValue) => …`, where
// `actor` is the live `Actor` the event fired for. The two objects share a name
// and only part of a surface, so a block whose method lives on only one of them
// generates fine and then throws "actor.useTraits is not a function" when the
// game runs. `world` has the same split — `WorldBuilder` under `define world`,
// the live `World` in a handler or a rule step.
//
// Only blocks whose method is genuinely one-sided need a guard, and the surface
// they share keeps growing:
//
//   - `set` is on both, so `set sprite` / `set position` are legitimately valid
//     in a template body *and* at runtime.
//   - `addEffect` is on both, so `add effect` is too — one block, either place.
//   - `useTraits` is builder-only; `Actor.removeEffect` is live-only.
//
// There WAS a world counterpart to the actor guard below, for the blocks whose
// call `WorldBuilder` had no method for. It is gone: the builder records calls
// and replays them, so its surface is the World's by construction and the
// guard could only ever warn about programs that work. `ActorBuilder` still
// accumulates, so its guard stays.
//
// Guarding a block that is valid in both would warn about correct programs,
// which is worse than not warning at all. Where a guard IS right, it catches
// the mistake in the editor, where the learner can see which block is wrong,
// rather than in a console message about a method name they never typed.

import type {Block} from 'blockly';

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {localizeText} from '../localizeBlocks';

import {addOnChange} from './onChange';

/**
 * Whether `block` sits somewhere the builder is what its code will call.
 *
 * An event handler is disqualifying even when it is *inside* one of `roots`,
 * because it rebinds the name; the walk therefore stops at the nearest of the
 * two rather than looking only for a root.
 */
export function inBuilderContext(
  block: Block,
  roots: readonly string[],
): boolean {
  for (let parent = block.getParent(); parent; parent = parent.getParent()) {
    if (parent.type.startsWith('world_on_')) {
      return false;
    }
    if (roots.includes(parent.type)) {
      return true;
    }
  }
  return false;
}

/** Build an extension that warns outside the given roots. */
function builderContextExtension(
  name: string,
  roots: readonly string[],
  warning: string,
): Extension {
  return defineExtension(name, {
    extension() {
      addOnChange(this, function (this: Block, event: Blockly.Events.Abstract) {
        // Re-check when the block's place in the tree could have changed; skip
        // flyout blocks, pure UI events, and transient mid-drag states.
        const workspace = this.workspace as Blockly.WorkspaceSvg;
        if (this.isInFlyout || event.isUiEvent || workspace?.isDragging?.()) {
          return;
        }
        // Namespaced so it coexists with any other warning on the block.
        this.setWarningText(
          inBuilderContext(this, roots) ? null : localizeText(warning),
          name,
        );
      });
    },
  });
}

export const RUNTIME_ACTOR_EXTENSION = 'world_needs_live_actor';

/**
 * Build an extension that warns INSIDE the given roots — the inverse of
 * {@link builderContextExtension}, for blocks that need a live object where
 * those roots supply a builder.
 */
function runtimeContextExtension(
  name: string,
  roots: readonly string[],
  warning: string,
): Extension {
  return defineExtension(name, {
    extension() {
      addOnChange(this, function (this: Block, event: Blockly.Events.Abstract) {
        const workspace = this.workspace as Blockly.WorkspaceSvg;
        if (this.isInFlyout || event.isUiEvent || workspace?.isDragging?.()) {
          return;
        }
        this.setWarningText(
          inBuilderContext(this, roots) ? localizeText(warning) : null,
          name,
        );
      });
    },
  });
}

/**
 * The mirror image: for blocks that need a LIVE actor.
 *
 * `remove effect` calls `Actor.removeEffect`, which the builder does not have —
 * un-declaring something on a template described once has no meaning, so it was
 * never added. Chained under `define actor` the block would run at module
 * scope, before any actor exists, against the builder; the warning fires there
 * and only there.
 *
 * `add effect` is deliberately NOT guarded: `addEffect` is on the builder too.
 *
 * Deliberately narrow. Elsewhere the block may well be fine: inside an event
 * handler `actor` is live, and anywhere an ACTOR socket is filled from a loop
 * ("for each actor touching…") the subject is live whatever encloses it. A
 * positive list of "places a live actor exists" would flag those, and a warning
 * on a working program is worse than none.
 */
export const runtimeActorExtension = runtimeContextExtension(
  RUNTIME_ACTOR_EXTENSION,
  ['world_actor'],
  'This happens while the game runs. Try placing it inside an event, not under "define actor".',
);

export const SHOW_AS_CONTEXT_EXTENSION = 'world_needs_actor_context';

/**
 * For `show as`, which has ONE home and would say nothing anywhere else.
 *
 * It is read off the file by a walk over `define actor` roots
 * (`actorIconMeta`), so a row that has drifted out of one is not merely inert —
 * nothing will ever look at it. A block that says nothing has to say so.
 */
export const actorContextExtension = builderContextExtension(
  SHOW_AS_CONTEXT_EXTENSION,
  ['world_actor'],
  'This says how a picker draws this kind of actor. Chain it under "define actor".',
);

export const TRAIT_CONTEXT_EXTENSION = 'world_needs_trait_context';

/** For the rows that describe a kind: only `define actor` holds them. */
export const traitContextExtension = builderContextExtension(
  TRAIT_CONTEXT_EXTENSION,
  ['world_actor'],
  'This is part of describing an actor. Try placing it under "define actor".',
);
