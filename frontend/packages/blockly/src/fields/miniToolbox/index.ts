// A "mini toolbox": a `+` on a block that opens a flyout of blocks inside it.
//
// The affordance Sprite Lab has used for years — `when ⟨sprite⟩ created` opens
// to reveal the block that names the new sprite — generalised out of
// `apps/src/blockly/utils/fields/miniToolbox`, which is tangled with procedures
// and the function editor. What is left is the mechanism: a toggle, a flyout
// field, and the input that carries it.
//
// WHY NOT A MUTATOR. Blockly already has a `+` on a block that opens a flyout,
// and it is the wrong one: a mutator's bubble targets its own hidden
// mini-workspace, so a block dragged out of it goes nowhere. This flyout is
// pointed at the block's own workspace (`FieldFlyout.showFlyout`), so dragging
// out of it is the ordinary toolbox drag.
//
// The block grows an input to hold the flyout and drops it again when the
// toggle is turned off, so a shut mini toolbox costs the block nothing but the
// button.

import * as Blockly from 'blockly/core';

import {FieldButton} from '../fieldButton';

import {FieldFlyout} from './FieldFlyout';

export {BlockFlyout} from './BlockFlyout';
export {FieldFlyout} from './FieldFlyout';

/** The input the flyout rides in, added and removed by the toggle. */
const FLYOUT_INPUT = 'MINI_TOOLBOX_FLYOUT';

/** FontAwesome's plus and minus. */
const PLUS = '';
const MINUS = '';

const glyph = (character: string): SVGElement => {
  const icon = document.createElementNS(
    'http://www.w3.org/2000/svg',
    'tspan',
  ) as SVGElement;
  icon.style.fontFamily = '"Font Awesome 6 Pro", "FontAwesome"';
  icon.textContent = character;
  return icon;
};

export interface MiniToolboxOptions {
  /** The block types the flyout offers, in order. */
  blocks: readonly string[];
  /** Tooltip on the toggle. */
  tooltip?: string;
}

/**
 * Give `block` a mini toolbox.
 *
 * Call from a block's `init` (or an extension): it inserts the toggle at the
 * front of the first row and registers what the flyout will contain. Nothing is
 * built until the toggle is pressed.
 */
export function addMiniToolbox(
  block: Blockly.BlockSvg,
  {blocks, tooltip}: MiniToolboxOptions,
): void {
  // Nothing to draw on, already done, or nowhere to draw: the headless
  // generator workspace renders nothing and reads no field of this, so it can
  // skip the whole affordance rather than build a button nobody sees.
  if (
    !block.inputList.length ||
    block.getField(`${FLYOUT_INPUT}_TOGGLE`) ||
    !block.workspace.rendered
  ) {
    return;
  }

  // Inline, and every row left-aligned: the flyout is usually wider than the
  // block's own words, and centred rows would leave the sentence wandering
  // above it as the flyout opens and shuts.
  block.setInputsInline(true);
  for (const input of block.inputList) {
    input.setAlign(Blockly.inputs.Align.LEFT);
  }

  // The flyout needs a row of its own to sit on. A block whose last input is a
  // value would otherwise put the flyout on the same line as it.
  const last = block.inputList[block.inputList.length - 1];
  if (
    ![
      Blockly.inputs.inputTypes.END_ROW,
      Blockly.inputs.inputTypes.STATEMENT,
    ].includes(last.type)
  ) {
    block.appendEndRowInput();
  }

  registerFlyoutContents(block, blocks);

  const toggle = new FieldButton({
    value: '',
    icon: glyph(PLUS),
    // Nothing is edited by opening a palette, so a read-only workspace may too.
    allowReadOnlyClick: true,
    onClick: () => toggleFlyout(block, toggle),
  });
  block.inputList[0].insertFieldAt(0, toggle, `${FLYOUT_INPUT}_TOGGLE`);
  if (tooltip) {
    toggle.setTooltip(tooltip);
  }
}

/** Open the flyout by adding its input, or shut it by removing it. */
function toggleFlyout(block: Blockly.BlockSvg, toggle: FieldButton): void {
  if (block.getInput(FLYOUT_INPUT)) {
    block.removeInput(FLYOUT_INPUT);
    setIcon(toggle, PLUS);
    return;
  }
  const key = FieldFlyout.flyoutIdFor(block);
  const field = new FieldFlyout('', {flyoutKey: key, name: 'FLYOUT'});
  block.appendDummyInput(FLYOUT_INPUT).appendField(field, key);
  field.showFlyout();
  setIcon(toggle, MINUS);
}

/**
 * Swap the button's glyph.
 *
 * `FieldButton` keeps its icon private and sizes itself from it, so the swap
 * goes through the DOM the field already drew and then asks for a re-measure —
 * the alternative is a second button class that exists only to hold two icons.
 */
function setIcon(toggle: FieldButton, character: string): void {
  const node = (toggle as unknown as {icon?: SVGElement}).icon;
  if (node) {
    node.textContent = character;
  }
  toggle.forceRerender();
}

/**
 * Tell the workspace what this block's flyout contains.
 *
 * Keyed by the block, not by its type: two `when … starts touching` hats each
 * get their own flyout, and a callback shared between them would hand the
 * second one the first one's contents.
 */
function registerFlyoutContents(
  block: Blockly.BlockSvg,
  blocks: readonly string[],
): void {
  if (!block.workspace.rendered) {
    return;
  }
  (block.workspace as Blockly.WorkspaceSvg).registerToolboxCategoryCallback(
    FieldFlyout.flyoutIdFor(block),
    () =>
      blocks.map(type => ({
        kind: 'block',
        type,
        // Which block opened this flyout, for a block that wants to know what
        // it came from — Sprite Lab's pointers read it to show the right image.
        extraState: {miniToolboxSourceId: block.id},
      })) as Blockly.utils.toolbox.FlyoutItemInfoArray,
  );
}
