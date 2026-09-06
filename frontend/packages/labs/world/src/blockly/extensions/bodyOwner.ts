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

import {HIDE_BODIES} from '../bodySurfaces';

import {removeBodyButton} from './bodyButton';

export const BODY_SURFACE_EXTENSION = 'world_body_surface';

/** The input a `define block` and an `each frame` keep their body in. */
const SOCKET = 'DO';

/**
 * Fields that belong to a member's own surface, not to the interface.
 *
 * `RETURNS` says whether a `define block` does something or reports something.
 * That is a fact about the implementation — a query has a `return` in it and
 * an action does not — so it is asked where the implementation is written, and
 * the interface shows the signature it produces instead.
 *
 * HIDDEN, NOT REMOVED. A field taken off a block is a field Blockly does not
 * save, and the interface is what the file is written from: removing `RETURNS`
 * there would drop it from every rule on the next save.
 */
const BODY_SURFACE_FIELDS: Readonly<Record<string, readonly string[]>> = {
  world_rule_block: ['RETURNS'],
};

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
      // Quiet: `world_trait_step` in an actor file has been through here
      // already on a previous render, and a missing input is not an error.
      block.removeInput(SOCKET, true);
      for (const name of BODY_SURFACE_FIELDS[block.type] ?? []) {
        block.getField(name)?.setVisible(false);
      }
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
  // The fields the interface stopped drawing are drawn HERE, and this is the
  // only place they can be changed. `bodySurfaces` carries what they say back
  // into the file.
  for (const name of BODY_SURFACE_FIELDS[block.type] ?? []) {
    block.getField(name)?.setVisible(true);
  }
  // …but not the signature, which is the one edit this surface cannot carry.
  // Redesigning a `define block` renames it, and a rename rewrites the block
  // TYPES its uses are written in, all over the file (`renameMemberReferences`)
  // — work the interface does on its own edits and this branch does not. The
  // gear stays on the interface until it does.
  (block as BlockSvg).setMutator?.(null);
}
