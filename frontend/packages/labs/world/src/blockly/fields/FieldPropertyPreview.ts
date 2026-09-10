// A field that draws one of the blocks a `define property` will make.
//
// `define property` says a name, a type and a default, and what comes of that
// is two blocks in the toolbox: `set health of ⟨this actor⟩ to ⟨100⟩` and
// `get health of ⟨this actor⟩`. The definition used to describe them in words
// and leave the learner to imagine the rest, which is the same gap `define
// block` closed by drawing its call site (`FieldBlockPreview`).
//
// So each of the two gets a field, and each field draws its block. What is
// drawn is not worked out here: the block's JSON and the shadows to seed into
// it arrive from `propertyShape`, which is also what the real blocks are built
// from (`domainBlocks`) — so the picture and the thing pictured cannot drift.
// Handing the drawing in rather than importing the recipe is what keeps this
// file out of a cycle with the 10,000 lines that own the recipe.

import * as Blockly from 'blockly/core';

import type {ShadowSpec} from '../valueShadow';

import {FieldBlockDrawing} from './FieldBlockDrawing';

/** A block to draw, and what to put in its sockets. */
export interface BlockDrawing {
  /** The block itself, as Blockly's block JSON. */
  definition: Record<string, unknown>;
  /** Shadows for its value inputs, as `registerValueShadows` takes them. */
  shadows?: ReadonlyArray<{name: string; shadow: ShadowSpec}>;
  /**
   * A socket to fill with a REAL block rather than a shadow — the subject.
   *
   * `set health of ⟨this actor⟩` is seeded with `this actor` at the call site
   * too, and it is drawn solid here for the same reason it is solid there: the
   * learner is expected to keep it as often as to replace it.
   */
  subject?: {name: string; type: string};
  /**
   * Drawn faded: the block is real, but not offered outside the file that
   * declares it. That is what a read-only property's setter is — see the eye
   * on `define property`.
   */
  muted?: boolean;
}

/** How much of a muted block is left. Enough to read, not enough to reach for. */
const MUTED_OPACITY = '0.4';

export class FieldPropertyPreview extends FieldBlockDrawing {
  private drawing: BlockDrawing | null = null;

  /** The block to draw, or nothing. Safe before the field is in the DOM. */
  setDrawing(drawing: BlockDrawing | null): void {
    this.drawing = drawing;
    this.redraw();
  }

  protected override drawnBlock(): Record<string, unknown> {
    // Never empty: Blockly cannot lay out a block with no message at all, and
    // a `define property` with its name field cleared has nothing to draw.
    return this.drawing?.definition ?? {message0: ' '};
  }

  protected override fill(
    block: Blockly.BlockSvg,
    mini: Blockly.WorkspaceSvg,
  ): void {
    const drawing = this.drawing;
    if (!drawing) {
      return;
    }
    if (drawing.subject) {
      const subject = mini.newBlock(drawing.subject.type) as Blockly.BlockSvg;
      subject.initSvg();
      block
        .getInput(drawing.subject.name)
        ?.connection?.connect(subject.outputConnection!);
    }
    for (const {name, shadow} of drawing.shadows ?? []) {
      // ONE SOCKET AT A TIME, for the reason `valueShadowExtension` gives: a
      // shadow that cannot be made throws, and an unguarded throw here would
      // cost the whole drawing rather than the one socket it belongs to.
      try {
        block.getInput(name)?.connection?.setShadowState(shadow);
      } catch (error) {
        console.warn(`world: could not draw the ${name} socket`, error);
      }
    }
    block
      .getSvgRoot()
      .setAttribute('opacity', drawing.muted ? MUTED_OPACITY : '1');
  }
}
