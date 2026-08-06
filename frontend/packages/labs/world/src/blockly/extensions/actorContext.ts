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
//   - `useTraits` is builder-only; `removeEffect` is live-only.
//
// Guarding a block that is valid in both would warn about correct programs,
// which is worse than not warning at all. Where a guard IS right, it catches
// the mistake in the editor, where the learner can see which block is wrong,
// rather than in a console message about a method name they never typed.

import type {Block} from 'blockly';

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

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
      this.setOnChange(function (this: Block, event: Blockly.Events.Abstract) {
        // Re-check when the block's place in the tree could have changed; skip
        // flyout blocks, pure UI events, and transient mid-drag states.
        const workspace = this.workspace as Blockly.WorkspaceSvg;
        if (this.isInFlyout || event.isUiEvent || workspace?.isDragging?.()) {
          return;
        }
        // Namespaced so it coexists with any other warning on the block.
        this.setWarningText(
          inBuilderContext(this, roots) ? null : warning,
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
      this.setOnChange(function (this: Block, event: Blockly.Events.Abstract) {
        const workspace = this.workspace as Blockly.WorkspaceSvg;
        if (this.isInFlyout || event.isUiEvent || workspace?.isDragging?.()) {
          return;
        }
        this.setWarningText(
          inBuilderContext(this, roots) ? warning : null,
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

export const RUNTIME_WORLD_EXTENSION = 'world_needs_live_world';

/**
 * For `remove effect from the world`.
 *
 * `World.removeEffect` is a method of the live world; `WorldBuilder` has no
 * counterpart, for the same reason the actor builder has none. Inside
 * `define world` the name `world` is the builder, so the call would be to a
 * method that is not there.
 *
 * Everywhere else `world` is the live instance: an event handler is
 * `(world, actor, eventValue)` and a rule step is `(world, delta)`. A block
 * with `world` unbound entirely is `worldContext`'s job, not this one, and the
 * two warnings coexist by using different ids.
 */
export const runtimeWorldExtension = runtimeContextExtension(
  RUNTIME_WORLD_EXTENSION,
  ['world_world'],
  'This happens while the game runs. Try placing it inside an event, not under "define world".',
);

export const BUILDER_WORLD_EXTENSION = 'world_needs_world_builder';

/**
 * For the blocks that PLACE actors: `add actor`, `load map`, `create … in map`.
 *
 * Placement is a `WorldBuilder` method and only that. `WorldBuilder` has
 * `define`, `loadMap` and an `addActor(builder, id, type)` that instantiates a
 * template; the live `World` has none of the first two and an `addActor(actor)`
 * that takes an already-made Actor. So `world.addActor(Coin, "c1", "actors/coin")`
 * — which is what the block generates — reaches the wrong object entirely once
 * `world` is the live one, and pushes an `ActorBuilder` into the actor list
 * rather than failing. Nothing throws; the game simply has a thing in it that
 * is not an actor, and every rule that walks the actors meets it.
 *
 * That is the whole reason this is a warning and not a comment somewhere: the
 * failure is silent, and it is silent in the one place a learner is most likely
 * to try it — spawning something from an event ("when the button is pressed,
 * add a coin"). Runtime spawning is a real thing to want and is not built; until
 * it is, saying so in the editor is the honest answer.
 */
export const builderWorldExtension = builderContextExtension(
  BUILDER_WORLD_EXTENSION,
  ['world_world'],
  'This places actors as the world is built. Chain it under "define world" — ' +
    'inside an event there is no world being built to add to.',
);

export const TRAIT_CONTEXT_EXTENSION = 'world_needs_trait_context';

/**
 * For `use trait`, which has three homes.
 *
 * Under `define actor` it generates `actor.useTraits([…])` on the builder.
 * Inside `define trait` it declares that trait's own dependencies, and is read
 * statically into `RuleMeta` — the rule blocks carry no generator, so nothing
 * is called there at all. Inside `define camera` the declaration collects it
 * and passes it to `defineCamera` in one call, so the block itself generates
 * nothing. All three are correct; a handler is not.
 */
export const traitContextExtension = builderContextExtension(
  TRAIT_CONTEXT_EXTENSION,
  ['world_actor', 'world_rule_trait', 'world_define_camera'],
  'This is part of describing an actor or a trait. Try placing it under "define actor" or inside "define trait".',
);
