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
