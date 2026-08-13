// A warning for blocks whose generated code references `pen`.
//
// `worldContext`'s counterpart, and the same failure it prevents: `pen.fill(…)`
// written where no drawing routine binds `pen` is a ReferenceError the moment
// the game runs, and a learner reading the block has nothing to tell them so.
//
// The list of places that bind it is ONE — `define drawing` — and that is not an
// oversight waiting to grow. A drawing is pure: it describes how an actor looks
// given what it currently is, and nothing else in the language is that
// (specs/DRAWING.md). If a second home ever appears, it appears here.

import type {Block} from 'blockly';

import {Blockly, defineExtension, type Extension} from '@code-dot-org/blockly';

import {addOnChange} from './onChange';

export const DRAWING_CONTEXT_EXTENSION = 'world_needs_drawing_context';

export const DEFINE_DRAWING = 'world_define_drawing';

const WARNING_TEXT =
  'There is nothing to draw on here! Try placing this inside a “define ' +
  'drawing”.';
const WARNING_ID = 'drawingContext';

/** Whether `pen` is in scope for `block` — that is, whether it is in a drawing. */
export function inDrawingContext(block: Block): boolean {
  for (let parent = block.getParent(); parent; parent = parent.getParent()) {
    if (parent.type === DEFINE_DRAWING) {
      return true;
    }
  }
  return false;
}

/** Warn a `pen`-referencing block when it is placed where `pen` is unbound. */
export const drawingContextExtension: Extension = defineExtension(
  DRAWING_CONTEXT_EXTENSION,
  {
    extension() {
      addOnChange(this, function (this: Block, event: Blockly.Events.Abstract) {
        const workspace = this.workspace as Blockly.WorkspaceSvg;
        if (this.isInFlyout || event.isUiEvent || workspace?.isDragging?.()) {
          return;
        }
        this.setWarningText(
          inDrawingContext(this) ? null : WARNING_TEXT,
          WARNING_ID,
        );
      });
    },
  },
);
