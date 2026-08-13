// The `+` on a contact hat: opens a flyout holding the actor the event is about.
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
