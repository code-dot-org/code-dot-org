// A warning for blocks whose generated code references `world`. `world` is bound
// in exactly two places: inside an event handler (a `world_on_*` block passes
// `(world, actor, eventValue)` to its body) and in a `.world` file (whose
// `world_world` root declares `const world`). Placed anywhere else — an actor's
// setup body, a scene, or floating — the `world.*` call would be a ReferenceError
// at runtime. This flags that early, in the editor, with a Blockly warning
// bubble, rather than letting it surface only when the game is run.

import type {Block} from 'blockly';

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

export const WORLD_CONTEXT_EXTENSION = 'world_needs_world_context';

const WARNING_TEXT =
  'We do not know what world we are on yet! Try placing this inside an event.';
// A namespaced warning id so this coexists with any other warning on the block.
const WARNING_ID = 'worldContext';

/**
 * Whether `world` is in scope for `block`: true if any ancestor is an event
 * handler (`world_on_*`) or the `world_world` root — the two blocks that bind it.
 */
export function inWorldContext(block: Block): boolean {
  for (let parent = block.getParent(); parent; parent = parent.getParent()) {
    if (
      parent.type === 'world_world' ||
      parent.type === 'world_rule_step' || // a step's body binds `world`
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
      this.setOnChange(function (this: Block, event: Blockly.Events.Abstract) {
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
