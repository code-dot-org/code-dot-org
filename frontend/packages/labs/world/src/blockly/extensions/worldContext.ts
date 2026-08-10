// A warning for blocks whose generated code references `world`. Placed where
// `world` is unbound — an actor's setup body, or floating — the `world.*` call
// would be a ReferenceError at runtime. This flags that in the editor rather
// than letting it surface when the game is run.
//
// The list of places that DO bind it has grown with rule authoring, and every
// omission was a warning on a correct program — the failure this file's actor
// counterpart explicitly warns against. A rule's action, query and step bodies
// all have a world: a world-scoped member is invoked as `(world, …)`, and an
// actor-scoped one opens by binding `const world = actor.world` (ruleMeta).

import type {Block} from 'blockly';

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {addOnChange} from './onChange';

export const WORLD_CONTEXT_EXTENSION = 'world_needs_world_context';

const WARNING_TEXT =
  'We do not know what world we are on yet! Try placing this inside an event.';
// A namespaced warning id so this coexists with any other warning on the block.
const WARNING_ID = 'worldContext';

/**
 * Whether `world` is in scope for `block`: true if any ancestor binds it — an
 * event handler, a `.world` file's root, or any of a rule's member bodies.
 */
export function inWorldContext(block: Block): boolean {
  for (let parent = block.getParent(); parent; parent = parent.getParent()) {
    if (
      parent.type === 'world_world' ||
      // Every rule-member body binds `world`: a step's closure is
      // `(world, delta)`, a designed block's is `(world, …params)`, and an
      // actor-scoped one binds it from `actor.world`. The step prefix covers
      // all three hats (`when tick`, `before …`, `after …`).
      parent.type.startsWith('world_rule_step') ||
      parent.type === 'world_rule_block' ||
      parent.type.startsWith('world_on_')
    ) {
      return true;
    }
  }
  return false;
}

/** Warn a `world`-referencing block when it is placed where `world` is unbound. */
export const worldContextExtension: Extension = defineExtension(
  WORLD_CONTEXT_EXTENSION,
  {
    extension() {
      addOnChange(this, function (this: Block, event: Blockly.Events.Abstract) {
        // Re-check when the block's place in the tree could have changed; skip
        // flyout blocks, pure UI events, and transient mid-drag states.
        const workspace = this.workspace as Blockly.WorkspaceSvg;
        if (this.isInFlyout || event.isUiEvent || workspace?.isDragging?.()) {
          return;
        }
        this.setWarningText(
          inWorldContext(this) ? null : WARNING_TEXT,
          WARNING_ID,
        );
      });
    },
  },
);
