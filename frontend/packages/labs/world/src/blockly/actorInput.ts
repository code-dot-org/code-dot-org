// A default `myself` shadow for a block's `ACTOR` value input, so an action
// block reads "… of [myself]" and works on the principal actor with nothing
// plugged in — dropping another actor value (e.g. the touched actor from a
// "for each … I'm touching" loop) into the socket retargets it. Attached as a
// block extension because the simplified toolbox lists blocks by type only and
// can't carry per-input shadow specs.

import {defineExtension, type Extension} from '@code-dot-org/blockly';

export const ACTOR_INPUT_EXTENSION = 'world_actor_input';

/** Give this block's `ACTOR` value input a default `world_myself` shadow. */
export const actorInputExtension: Extension = defineExtension(
  ACTOR_INPUT_EXTENSION,
  {
    extension() {
      const connection = this.getInput('ACTOR')?.connection;
      // Only seed the shadow on a fresh block; a saved/real block keeps its own.
      if (connection && !connection.targetBlock()) {
        connection.setShadowState({type: 'world_myself'});
      }
    },
  },
);
