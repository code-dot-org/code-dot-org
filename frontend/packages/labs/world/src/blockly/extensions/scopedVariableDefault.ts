// A reader takes the first name it can see, rather than none.
//
// `???` means "there is nothing here to name" — an empty scope. It should not
// also mean "you have not picked yet": a getter dropped into a body that has
// exactly one name in it wants that name, and making somebody open a menu with
// one entry to say so is a step that teaches nothing.
//
// WHEN, and it is the whole of the difficulty. Coercing during validation
// would rewrite a whole file on load: blocks are created before they are
// connected, so every getter is briefly floating, sees an empty scope, and
// would be "corrected" to nothing at the moment it is least able to say what
// it means. So this listens for the two events that happen when a block is
// somewhere — it was MOVED, or the file finished loading — and never for the
// one that happens when it is made.
//
// It only ever fills a name IN: a field that already holds one the block can
// see is left alone, and a scope with nothing in it still draws `???`.

import type {Block} from 'blockly';
import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {NO_VARIABLE, ScopedFieldVariable} from '../fields/scopedVariable';
import {binderOf} from '../variableScope';

import {addOnChange} from './onChange';

export const SCOPED_DEFAULT_EXTENSION = 'world_scoped_variable_default';

/** Whether `block` is the one that moved, or sits inside it. */
function within(block: Block, movedId: string | undefined): boolean {
  if (!movedId) {
    return false;
  }
  for (let at: Block | null = block; at; at = at.getParent()) {
    if (at.id === movedId) {
      return true;
    }
  }
  return false;
}

/** The first real name this field could hold, if there is one. */
function firstInScope(field: ScopedFieldVariable): string | undefined {
  for (const [, id] of field.getOptions()) {
    if (typeof id === 'string' && id !== NO_VARIABLE) {
      return id;
    }
  }
  return undefined;
}

const STRAY = 'stray-name';

/** What a reader holding a name it cannot see is told, or null. */
export function strayWarning(field: ScopedFieldVariable): string | null {
  const name = field.strayName();
  const block = field.getSourceBlock();
  const id = field.getValue();
  if (name === undefined || !block || typeof id !== 'string') {
    return null;
  }
  const binder = binderOf(block.workspace, id);
  const where = binder && block.workspace.getBlockById(binder.id);
  const head = where ? headText(where) : '';
  return head
    ? `${name} is only known inside “${head}”.`
    : `${name} is not known here.`;
}

/** A block's own words, as drawn: `toString` also reads hidden fields. */
function headText(block: Block): string {
  return block.inputList
    .filter(input => input.isVisible())
    .flatMap(input => input.fieldRow)
    .filter(field => field.isVisible())
    .map(field => field.getText().trim())
    .filter(Boolean)
    .join(' ');
}

export const scopedVariableDefaultExtension: Extension = defineExtension(
  SCOPED_DEFAULT_EXTENSION,
  {
    extension() {
      const block = this as unknown as Block;
      addOnChange(block, function (event) {
        if (block.isInFlyout || event.isUiEvent) {
          return;
        }
        const workspace = block.workspace as {isDragging?: () => boolean};
        if (workspace?.isDragging?.()) {
          return;
        }
        const moved = event.type === Blockly.Events.BLOCK_MOVE;
        const loaded = event.type === Blockly.Events.FINISHED_LOADING;
        // NOT `BLOCK_CREATE`. Every block in a file is created before it is
        // connected, so acting on one would judge a getter's scope while it is
        // still floating — which is empty, for all of them, every load.
        if (!loaded && !moved) {
          return;
        }
        if (moved && !within(block, (event as {blockId?: string}).blockId)) {
          return;
        }
        const field = block.getField('VAR');
        if (!(field instanceof ScopedFieldVariable)) {
          return;
        }
        if (!field.namesSomething()) {
          const first = firstInScope(field);
          if (first) {
            field.setValue(first);
          }
        }
        block.setWarningText?.(strayWarning(field), STRAY);
        // AND REPAINT, whether or not a name was filled in. A field's text is
        // drawn once and redrawn when something says so, and BOTH ways a move
        // changes what it should say happen behind the render's back: a name
        // set from here, and a name that has just gone out of scope because
        // the block was carried away from what declared it. Without this the
        // block goes on showing whatever it last drew — which is
        // indistinguishable from none of this having happened
        // (`blockly/moduleOptions` makes the same point about live dropdowns).
        field.forceRerender();
      });
    },
  },
);
