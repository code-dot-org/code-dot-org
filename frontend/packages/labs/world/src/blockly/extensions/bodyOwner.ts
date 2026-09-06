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

import {ARGUMENTS_INPUT, DESCRIPTION_ROW, RETURNS_ROW} from './blockDesigner';
import {removeBodyButton} from './bodyButton';

export const BODY_SURFACE_EXTENSION = 'world_body_surface';

/** The input a `define block` and an `each frame` keep their body in. */
const SOCKET = 'DO';

/**
 * Rows that belong to a member's own surface, not to the interface.
 *
 * `returns` says whether a `define block` does something or reports something,
 * `arguments` is the signature it takes, and `description` is what the block
 * is for. All three are facts about the implementation — the one that has a
 * `return` in it, the one whose parameters the body reads, the one whose
 * purpose its author is explaining — so they are asked where it is written.
 * The interface shows the block they produce instead.
 *
 * HIDDEN, NOT REMOVED, and by ROW rather than by field. A field taken off a
 * block is a field Blockly does not save, and the interface is what the file
 * is written from: removing `RETURNS` there would drop it from every rule on
 * the next save. Hiding the whole row takes its label with it, which hiding
 * the field alone did not — a bare `returns` with nothing after it.
 */
const BODY_SURFACE_ROWS: Readonly<Record<string, readonly string[]>> = {
  world_rule_block: [DESCRIPTION_ROW, RETURNS_ROW, ARGUMENTS_INPUT],
  // An event has no implementation, so its surface is its phrasing and
  // nothing else — but the row is hidden on the interface for the same reason
  // the others are: what the block IS belongs where it is written.
  world_rule_event: [ARGUMENTS_INPUT],
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
      for (const name of BODY_SURFACE_ROWS[block.type] ?? []) {
        block.getInput(name)?.setVisible(false);
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
  // The rows the interface stopped drawing are drawn HERE, and this is the
  // only place they can be changed. `bodySurfaces` carries what they say back
  // into the file.
  for (const name of BODY_SURFACE_ROWS[block.type] ?? []) {
    block.getInput(name)?.setVisible(true);
  }
  // …and the signature is written into the `arguments` row as blocks. It
  // lives in `extraState.parts`, which is still what the file holds; these are
  // the editor for it, and there is no gear any more to open one elsewhere.
  (block as unknown as {buildArguments_?: () => void}).buildArguments_?.();
  (block as BlockSvg).render?.();
}
