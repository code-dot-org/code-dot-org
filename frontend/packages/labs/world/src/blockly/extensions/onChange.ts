// Adding a change handler to a block, rather than replacing the one it has.
//
// `Block.setOnChange` sets ONE handler: the second caller silently replaces the
// first. That is fine for a block with one extension and wrong for a block with
// two, and we have both — `world_use_trait` carries `traitContextExtension`
// (which warns when the block sits outside a rule) and `openSourceButtonExtension`
// (which adds and removes the eye), and extensions apply in array order, so the
// eye was quietly winning and the warning never updated after the first render.
//
// Nothing failed loudly. A warning that does not appear looks exactly like a
// block that is fine, which is why this went unnoticed: the bug is the absence
// of a complaint.
//
// So: compose. Every handler an extension adds runs, in the order the
// extensions were listed, and no extension has to know what else is on the
// block — which is the property that makes extensions composable at all.

import type {Blockly} from '@code-dot-org/blockly';

type ChangeHandler = (
  this: Blockly.Block,
  event: Blockly.Events.Abstract,
) => void;

/**
 * Run `handler` on every workspace change, after any already registered.
 *
 * Ordering is the order extensions were applied, which is the order they are
 * listed on the block. Nothing here depends on that order; it is stated only so
 * that a handler which DOES care has somewhere to read it from.
 */
export function addOnChange(
  block: Blockly.Block,
  handler: ChangeHandler,
): void {
  // Optional, like `getSurroundParent?.()` elsewhere: an extension is also run
  // against a plain stand-in in tests, and a block that cannot report changes
  // has none to report.
  const setOnChange = (
    block as {setOnChange?: (fn: ChangeHandler) => void}
  ).setOnChange?.bind(block);
  if (!setOnChange) {
    return;
  }
  const existing = (block as {onchange?: ChangeHandler}).onchange;
  setOnChange(function (this: Blockly.Block, event) {
    existing?.call(this, event);
    handler.call(this, event);
  });
}

/**
 * Whether a change is worth re-reading the block's surroundings for.
 *
 * The guard three extensions had each written out: a flyout block has no
 * context to read, a UI event (a click, a scroll) changes nothing structural,
 * and mid-drag the tree is in a state nobody asked for and will not keep.
 */
export function isStructuralChange(
  block: Blockly.Block,
  event: Blockly.Events.Abstract,
): boolean {
  const workspace = block.workspace as Blockly.WorkspaceSvg;
  return !block.isInFlyout && !event.isUiEvent && !workspace?.isDragging?.();
}
