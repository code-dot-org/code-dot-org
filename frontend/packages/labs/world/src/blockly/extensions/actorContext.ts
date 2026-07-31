// A warning for blocks that configure an actor TEMPLATE rather than a live one.
//
// `define actor` builds an `ActorBuilder`, and blocks chained under it call
// builder methods (`useTraits`, `useEffect`) on the `actor` const it declares.
// An event handler rebinds that name: `world_on_*` generates
// `(world, actor, eventValue) => …`, where `actor` is the live `Actor` instance
// the event fired for. The two objects share a name and almost nothing else, so
// a template block placed inside a handler compiles fine and then throws
// "actor.useEffect is not a function" when the game runs.
//
// The mirror of `worldContext`, and for the same reason: catch it in the editor,
// where the learner can see which block is wrong, rather than in a console
// message about a method name they never typed.

import type {Block} from 'blockly';

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

export const ACTOR_DEFINITION_EXTENSION = 'world_needs_actor_definition';

const WARNING_TEXT =
  'This is part of describing an actor. Try placing it under "define actor".';
// Namespaced so it coexists with any other warning on the block.
const WARNING_ID = 'actorDefinition';

/**
 * Whether `block` sits in an actor's definition body — that is, whether `actor`
 * means the builder here.
 *
 * An event handler is the disqualifying case even though it may be *inside* an
 * `.actor` file, because it rebinds the name; the walk therefore stops at the
 * nearest of the two rather than looking only for `world_actor`.
 */
export function inActorDefinition(block: Block): boolean {
  for (let parent = block.getParent(); parent; parent = parent.getParent()) {
    if (parent.type.startsWith('world_on_')) {
      return false;
    }
    if (parent.type === 'world_actor') {
      return true;
    }
  }
  return false;
}

/** Warn a template-configuring block placed where `actor` is not the builder. */
export const actorDefinitionExtension: Extension = defineExtension(
  ACTOR_DEFINITION_EXTENSION,
  {
    extension() {
      this.setOnChange(function (this: Block, event: Blockly.Events.Abstract) {
        // Re-check when the block's place in the tree could have changed; skip
        // flyout blocks, pure UI events, and transient mid-drag states.
        const workspace = this.workspace as Blockly.WorkspaceSvg;
        if (this.isInFlyout || event.isUiEvent || workspace?.isDragging?.()) {
          return;
        }
        this.setWarningText(
          inActorDefinition(this) ? null : WARNING_TEXT,
          WARNING_ID,
        );
      });
    },
  },
);
