// The `+` on a hat: a flyout holding what the event hands the handler.
//
// Two of them, because there are two answers. A hat whose event carries one
// actor offers `event actor`, which is what the language calls that value; any
// other designed signature offers one block per value, named as its author
// named it (specs/EVENT_VALUES_PLAN.md).
//
// `event actor` is a block in the Actor category, and a learner who knows that
// needs nothing here. This is for the one who does not — looking at
// `when ⟨this actor⟩ starts touching ⟨Brick ▾⟩`, wanting to remove the brick,
// with no reason to guess that the way to name it lives three categories away.
// The affordance belongs on the block that knows the answer.
//
// The mechanism is `addMiniToolbox` in `@code-dot-org/blockly` — the same one
// Sprite Lab's `when ⟨sprite⟩ created` has used for years, lifted out of
// `apps/` into the shared package. A real flyout inside the block, pointed at
// the block's own workspace, so a block dragged out of it lands in the program.
//
// NOT a mutator, though Blockly's mutator also puts a `+` on a block and opens
// a flyout. A mutator's bubble targets its own hidden workspace, so nothing can
// be dragged out of one — that version was built and rejected for exactly that.

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {addMiniToolbox} from '@code-dot-org/blockly/fields/miniToolbox';

export const EVENT_ACTOR_TOOLBOX_EXTENSION = 'world_event_actor_toolbox';

export const eventActorToolboxExtension: Extension = defineExtension(
  EVENT_ACTOR_TOOLBOX_EXTENSION,
  {
    extension() {
      addMiniToolbox(this, {
        blocks: ['world_event_actor'],
        tooltip: 'The actor this event is about',
      });
    },
  },
);

/**
 * What a hat's `+` offers, by hat type.
 *
 * A REGISTRY RATHER THAN A PER-EVENT EXTENSION. An extension is registered
 * under a name once and a second registration of the same name keeps the
 * first body (`@code-dot-org/blockly`, `Registry.registerExtension`), so an
 * extension minted per event would go stale the moment its signature was
 * edited — which is a thing a learner does while the lab is running. This is
 * one shared extension that asks, at the moment a hat is built, what that
 * hat's event carries.
 */
const flyoutBlocks = new Map<string, readonly string[]>();

/** Say what the `+` on `hatType` offers. Called wherever a hat is minted. */
export const registerEventFlyout = (
  hatType: string,
  blocks: readonly string[],
): void => {
  flyoutBlocks.set(hatType, blocks);
};

/** What the `+` on `hatType` offers — empty when it has no flyout. */
export const eventFlyoutBlocks = (hatType: string): readonly string[] =>
  flyoutBlocks.get(hatType) ?? [];

export const EVENT_VALUES_TOOLBOX_EXTENSION = 'world_event_values_toolbox';

/**
 * The `+` on a hat whose event carries values its author named.
 *
 * One block per value, in the signature's order, wearing the name the author
 * gave it (specs/EVENT_VALUES_PLAN.md). Same reasoning as the actor above:
 * the way to name what the event brought should start on the block that
 * brought it.
 */
export const eventValuesToolboxExtension: Extension = defineExtension(
  EVENT_VALUES_TOOLBOX_EXTENSION,
  {
    extension() {
      const blocks = eventFlyoutBlocks(this.type);
      if (blocks.length === 0) {
        return;
      }
      addMiniToolbox(this, {
        blocks,
        tooltip: 'What this event carries',
      });
    },
  },
);
