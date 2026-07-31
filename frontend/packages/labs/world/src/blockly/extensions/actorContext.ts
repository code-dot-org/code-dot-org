// A warning for blocks that configure an actor TEMPLATE rather than a live one.
//
// `define actor` builds an `ActorBuilder`, and some blocks chained under it call
// methods that exist only there — `useTraits`, `useEffect`. An event handler
// rebinds the name they call them on: `world_on_*` generates
// `(world, actor, eventValue) => …`, where `actor` is the live `Actor` the event
// fired for. The two objects share a name and only part of a surface, so a
// template block placed inside a handler generates fine and then throws
// "actor.useTraits is not a function" when the game runs.
//
// Only blocks whose method is builder-ONLY need this. `set sprite` and
// `set position` call `set`, which both `ActorBuilder` and `Actor` have, so they
// are legitimately valid in a template body *and* at runtime — guarding them
// would warn about correct programs.
//
// The mirror of `worldContext`, and for the same reason: catch it in the editor,
// where the learner can see which block is wrong, rather than in a console
// message about a method name they never typed.

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

export const ACTOR_DEFINITION_EXTENSION = 'world_needs_actor_definition';

/** For `use effect`: `ActorBuilder.useEffect` exists nowhere else. */
export const actorDefinitionExtension = builderContextExtension(
  ACTOR_DEFINITION_EXTENSION,
  ['world_actor'],
  'This is part of describing an actor. Try placing it under "define actor".',
);

export const WORLD_DEFINITION_EXTENSION = 'world_needs_world_definition';

/**
 * For blocks that call a `WorldBuilder` method — `use effect` on a `.world`.
 *
 * Same trap one level up: `define world` declares `const world = new
 * WorldBuilder(...)`, while an event handler and a rule step both rebind
 * `world` to the live `World`. `WorldBuilder.useEffect` is builder-only, so a
 * handler would call a method that is not there.
 */
export const worldDefinitionExtension = builderContextExtension(
  WORLD_DEFINITION_EXTENSION,
  ['world_world'],
  'This is part of describing a world. Try placing it under "define world".',
);

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
 * `add effect` and `remove effect` call `Actor` methods, which the builder does
 * not have. Chained under `define actor` they would run at module scope, before
 * any actor exists, against the builder — so the warning fires there and only
 * there.
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
 * For `add effect to the world` / `remove effect from the world`.
 *
 * `World.addEffect` is a method of the live world; `WorldBuilder` has only
 * `useEffect`. Inside `define world` the name `world` is the builder, so the
 * call would be to a method that is not there — and the fix is to say
 * `use effect` instead, which is what the message points at.
 *
 * Everywhere else `world` is the live instance: an event handler is
 * `(world, actor, eventValue)` and a rule step is `(world, delta)`. A block
 * with `world` unbound entirely is `worldContext`'s job, not this one, and the
 * two warnings coexist by using different ids.
 */
export const runtimeWorldExtension = runtimeContextExtension(
  RUNTIME_WORLD_EXTENSION,
  ['world_world'],
  'This happens while the game runs. To give the world an effect from the start, use "use effect" instead.',
);

export const TRAIT_CONTEXT_EXTENSION = 'world_needs_trait_context';

/**
 * For `use trait`, which has two homes.
 *
 * Under `define actor` it generates `actor.useTraits([…])` on the builder.
 * Inside `define trait` it declares that trait's own dependencies, and is read
 * statically into `RuleMeta` — the rule blocks carry no generator, so nothing
 * is called there at all. Both are correct; a handler is not.
 */
export const traitContextExtension = builderContextExtension(
  TRAIT_CONTEXT_EXTENSION,
  ['world_actor', 'world_rule_trait'],
  'This is part of describing an actor or a trait. Try placing it under "define actor" or inside "define trait".',
);
