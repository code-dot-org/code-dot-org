// A default shadow for a block's `ACTOR` value input, so an action block reads
// "… of [this actor]" and works with nothing plugged in — dropping another actor
// value (e.g. a `for each` loop's actor variable) into the socket retargets it.
// Attached as a block extension because the simplified toolbox lists blocks by
// type only and can't carry per-input shadow specs.
//
// WHICH shadow depends on the file. An `.actor` file is about one actor, so the
// subject is obvious and `this actor` is it. A `.world` file names several and
// has no principal one — `actor` is not bound there at all — so the default is
// `any <kind>`, which resolves to a template and reads "when any Coin starts
// falling" (blockly/localActors, and `world_actor_kind`).

import type {WorkspaceSvg} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {definesWorld} from './localActors';

export const ACTOR_INPUT_EXTENSION = 'world_actor_input';

/** Give this block's `ACTOR` value input a default `world_this_actor` shadow. */
export const actorInputExtension: Extension = defineExtension(
  ACTOR_INPUT_EXTENSION,
  {
    extension() {
      const connection = this.getInput('ACTOR')?.connection;
      // Only seed the shadow on a fresh block; a saved/real block keeps its own.
      if (connection && !connection.targetBlock()) {
        // A block in a flyout is a preview of one you might drag out, so the
        // question is asked of the workspace it would land in.
        const workspace = this.workspace as WorkspaceSvg;
        const target =
          (workspace?.isFlyout ? workspace.targetWorkspace : workspace) ??
          undefined;
        connection.setShadowState({
          type: definesWorld(target) ? 'world_actor_kind' : 'world_this_actor',
        });
      }
    },
  },
);
