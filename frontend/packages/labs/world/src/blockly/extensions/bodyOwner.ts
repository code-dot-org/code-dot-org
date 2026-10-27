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

import type {Block, BlockSvg} from 'blockly';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {BODY_OWNER_ID, HIDE_BODIES} from '../bodySurfaces';

import {removeBodyButton} from './bodyButton';

export const BODY_SURFACE_EXTENSION = 'world_body_surface';

/** The input an `each frame` and a `define drawing` keep their body in. */
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
export const bodySurfaceExtension: Extension = defineExtension(
  BODY_SURFACE_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      if (!HIDE_BODIES || isForGenerator(block)) {
        return;
      }
      // THE HEAD OF A SURFACE WEARS A `next`, WHATEVER IT WEARS ELSEWHERE.
      //
      // A body hangs off the head's `next` on the surface, wherever the FILE
      // holds it (`bodySurfaces.bodyOf`) — and `each frame` in an `.actor`
      // file is built as a definition ROOT, with neither connection, because a
      // top-level block with a previous is an orphan to `DisableOrphansPlugin`
      // (`domainBlocks.traitStepDefinition`). So the one block whose body is
      // the whole point of the surface was the one block that could not hold
      // it, and opening it threw out of Blockly's deserializer before anything
      // rendered:
      //
      //   The block "world_trait_step" (id="body-owner") is missing a(n) next
      //
      // Only the copy, and only the NEXT: `anchorBodyOwner` takes the previous
      // off again on the way in, so the head is still a root and still cannot
      // be chained to anything above it. The block on the interface — the real
      // one, with its own id — keeps the shape its file gave it.
      //
      // HERE rather than in `anchorBodyOwner`, which is the other half of this
      // and would be the obvious home for it. That runs after the document is
      // on the workspace; this has to be true BEFORE, because the connection
      // is what the loader is looking for while it is attaching the body.
      if (block.id === BODY_OWNER_ID && !block.nextConnection) {
        block.setNextStatement(true);
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
  // Nothing goes above the head. On the interface this connection is how a
  // member follows another; here there is only ever one block to be head of.
  if (block.previousConnection) {
    block.setPreviousStatement(false);
  }
  (block as BlockSvg).render?.();
}
