// A block whose implementation is somewhere else, on each of the two surfaces.
//
// specs/NEXT.md §8. `bodyButton` puts the way IN on such a block; this is what
// the block looks like once the body has been taken out of it — an empty `do`
// on the interface, and a fixed head on the body's own surface.
//
// THE SOCKET CANNOT SIMPLY BE DELETED FROM THE DEFINITION. `BlocklyGenerator`
// loads whole files — bodies and all — into a headless workspace to compile
// them, so a `define block` with no `DO` input would drop every body on the
// floor at generation time. What differs is the SURFACE, and the generator
// already marks its own workspace (`isRuleGenerator`), which is what this
// reads. No flag of its own, and nothing to keep in step with a load.

import type {Block} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {HIDE_BODIES} from '../bodySurfaces';

import {removeBodyButton} from './bodyButton';

export const BODY_SOCKET_EXTENSION = 'world_body_socket';

/** The input a `define block` and an `each frame` keep their body in. */
const SOCKET = 'DO';

/**
 * Whether this workspace exists to compile rather than to be read.
 *
 * `BlocklyGenerator` sets it before any block loads, for exactly this kind of
 * question — a mutator already reads it to skip drawing.
 */
const isForGenerator = (block: Block): boolean =>
  Boolean((block.workspace as {isRuleGenerator?: boolean}).isRuleGenerator);

/**
 * Drop the `do` row on the surface that never fills it.
 *
 * With the split on, a member's body is not in the workspace, so the socket is
 * empty every time and says nothing: `define block` grew a `do` with a hole
 * under it and no way to put anything in the hole. The pencil is the way in
 * now, and the row is gone.
 */
export const bodySocketExtension: Extension = defineExtension(
  BODY_SOCKET_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      if (!HIDE_BODIES || isForGenerator(block)) {
        return;
      }
      // Quiet: `world_trait_step` in an actor file has been through here
      // already on a previous render, and a missing input is not an error.
      block.removeInput(SOCKET, true);
    },
  },
);

/**
 * Make a block the head of its own body's surface.
 *
 * What `define rule` is to a rule file: the thing everything else hangs off,
 * which cannot be dragged away or deleted, and which says what is being
 * written. Applied to the copy `bodySurfaces.bodyOf` puts at the top — the
 * real block is on the interface, and this one is standing in for it.
 *
 * IMPERATIVE rather than saved into the document, because these are the
 * block's own properties and not the file's: nothing about a member is
 * "undeletable" in the rule it belongs to, only in the surface that is
 * currently implementing it.
 */
export function anchorBodyOwner(block: Block): void {
  // No way in from inside: the pencil opens this surface, and it is up.
  removeBodyButton(block);
  block.setMovable(false);
  block.setDeletable(false);
  // Read-only FOR NOW. The head shows the member's name, description and
  // signature so the surface says what it is implementing — but the interface
  // is where those are edited, and a second editable copy of a field is a
  // second answer to what the file says. Making this one authoritative is
  // what moving `RETURNS` down here needs (§8).
  block.setEditable(false);
  // Nothing goes above the head. On the interface this connection is how a
  // member follows another; here there is only ever one block to be head of.
  if (block.previousConnection) {
    block.setPreviousStatement(false);
  }
}
