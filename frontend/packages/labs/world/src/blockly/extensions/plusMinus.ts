// The `+` and `−` that grow a block, in place of a mutator bubble.
//
// A Blockly mutator normally opens a BUBBLE: a mini-workspace holding a
// container block, into which you drag one piece per branch. It is a lot of
// gesture to say "one more", and every step of it has to be guessed — notice
// the ⚙, open it, find the piece, drag it onto a stack, close the bubble
// again. A `+` beside the thing that is about to grow says the same in one
// click, in the place the change appears, and a `−` beside a branch says what
// it removes by sitting on it.
//
// This is what the legacy labs do (`apps/src/blockly/addons/plusMinusBlocks`,
// itself derived from `@blockly/block-plus-minus`). What is NOT carried over is
// the drawing: those are white glyphs baked into a data URI, which works
// because Sprite Lab's blocks are dark. This lab's block colours are a THEME a
// learner picks, in light and dark pairs (`worldBlocklyTheme`), so a fixed
// white would go invisible on half of them. These are `FieldButton`s wearing a
// FontAwesome glyph — the same button the open, the mortarboard and the
// sparkles ride on — which take their colours from the block they land on.
//
// WHAT A CALLER OWES is the mutation event. Blockly fires one itself when a
// shape change comes out of a mutator bubble, and undo replays it; a field
// click happens outside that machinery, so an unwrapped `+` reshapes the block
// and leaves undo with nothing to undo. `mutate` is that wrapper, and every
// button made here already goes through it.

import * as Blockly from 'blockly/core';
import type {Block, BlockSvg} from 'blockly/core';

import {FieldButton} from '@code-dot-org/blockly/fields/fieldButton';

import {localizeText} from '../localizeBlocks';

import {glyphIcon} from './glyphIcon';

/** FontAwesome `plus` (f067) and `minus` (f068). Both are in the free set. */
const PLUS = '';
const MINUS = '';

/**
 * This block's serialized extra state, as a string to compare two of.
 *
 * JSON only. Blockly still accepts the XML pair (`mutationToDom` /
 * `domToMutation`) and the legacy version of this file reads both, because
 * `apps/` still has workspaces saved as XML. Nothing in this lab does — a
 * `.rule` and an `.actor` are `Blockly.serialization.workspaces` JSON and have
 * never been anything else (INTERFACE.md) — so a block with only XML hooks
 * here would be a block that does not save, which is louder than this omission.
 */
function extraState(block: Block): string {
  const saved = (block as {saveExtraState?: () => unknown}).saveExtraState?.();
  return saved ? JSON.stringify(saved) : '';
}

/**
 * Reshape a block, as one undoable edit.
 *
 * The `mutation` change event is what undo replays, and it carries the state
 * either side of the change rather than a description of it — so it can only
 * be fired once the change has happened, from the two answers `saveExtraState`
 * gave. A change that did not alter the state fires nothing: a `−` pressed on
 * a branch that is not there should not put an empty step on the undo stack.
 *
 * The group is what makes it ONE edit. A reshape can disconnect blocks and
 * bump their neighbours, each of which is an event of its own; without the
 * group, undoing an `else if` would take several presses and pass through
 * states the learner never saw.
 */
export function mutate(block: Block, change: () => void): void {
  const before = extraState(block);
  Blockly.Events.setGroup(true);
  try {
    change();
  } finally {
    const after = extraState(block);
    if (after !== before) {
      Blockly.Events.fire(
        new Blockly.Events.BlockChange(block, 'mutation', null, before, after),
      );
    }
    Blockly.Events.setGroup(false);
  }
}

/**
 * One button, wired to reshape the block it is sitting on.
 *
 * NOT SAVED, and not editable. `FieldButton` sets `SERIALIZABLE`, and a field
 * that a mutator adds and removes must not be written into the file: the block
 * that reads it back may have no such row, and Blockly says so once per block
 * on every load. Both flags, for the reason `openSourceButton` sets out at
 * length — an editable field is serialized whether or not it says it is.
 *
 * IN A FLYOUT IT DOES NOTHING. A toolbox flyout that does not close on its own
 * leaves its fields clickable (`Field.isClickableInFlyout`), so without this a
 * learner could grow the PICTURE of the block they were about to drag out.
 */
function button(
  glyph: string,
  tooltip: string,
  change: (block: BlockSvg) => void,
): FieldButton {
  const field: FieldButton = new FieldButton({
    value: '',
    icon: glyphIcon(glyph),
    onClick: () => {
      const block = field.getSourceBlock() as BlockSvg | null;
      if (!block || block.isInFlyout) {
        return;
      }
      mutate(block, () => change(block));
    },
  });
  field.setTooltip(localizeText(tooltip));
  field.SERIALIZABLE = false;
  field.EDITABLE = false;
  return field;
}

/** A `+` that grows the block it rides on. */
export const plusField = (
  tooltip: string,
  change: (block: BlockSvg) => void,
): FieldButton => button(PLUS, tooltip, change);

/** A `−` that takes away the branch it sits beside. */
export const minusField = (
  tooltip: string,
  change: (block: BlockSvg) => void,
): FieldButton => button(MINUS, tooltip, change);
