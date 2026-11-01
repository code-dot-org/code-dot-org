// Which variable a `let` gives, as it is named and moved.
//
// A binding owns its variable, except that a `let` naming a binding already
// visible joins it and sets it (specs/VARIABLE_OWNERSHIP_PLAN.md). So a `let`
// carried under another of its name joins it, and one carried out from under
// it is given a variable of its own again; the getters below it follow.

import * as Blockly from 'blockly/core';

import {defineExtension, type Extension} from '@code-dot-org/blockly';

import {addOnChange} from './extensions/onChange';
import {bindingCount, isRedeclaration, visibleNamed} from './variableScope';

/** Every block below `binder` in its stack, and inside them: where it binds. */
function scopeOf(binder: Blockly.Block): Blockly.Block[] {
  const below: Blockly.Block[] = [];
  for (let at = binder.getNextBlock(); at; at = at.getNextBlock()) {
    below.push(...at.getDescendants(false));
  }
  return below;
}

/**
 * Point the readers in `binder`'s scope from one variable to another, and
 * drop the first if nothing names it any more.
 */
export function moveReaders(binder: Blockly.Block, from: string, to: string) {
  for (const block of scopeOf(binder)) {
    block.renameVarById(from, to);
  }
  const workspace = binder.workspace;
  const map = workspace.getVariableMap();
  const variable = map.getVariableById(from);
  if (
    variable &&
    bindingCount(workspace, from) === 0 &&
    Blockly.Variables.getVariableUsesById(workspace, from).length === 0
  ) {
    map.deleteVariable(variable);
  }
}

/** The kind of block this governs: a declaration over the rows below it. */
export const isLet = (block: Blockly.Block): boolean =>
  block.type.startsWith('world_let_');

/**
 * Join a visible binding of the same name, or leave one that is no longer
 * visible. Answers whether anything changed.
 */
export function settleLet(block: Blockly.Block): boolean {
  const id = block.getFieldValue('VAR');
  const map = block.workspace.getVariableMap();
  const variable = typeof id === 'string' ? map.getVariableById(id) : null;
  if (!variable) {
    return false;
  }
  const name = variable.getName();
  const type = variable.getType();
  const visible = visibleNamed(block, name, type);
  if (visible && visible !== id) {
    block.setFieldValue(visible, 'VAR');
    moveReaders(block, id, visible);
    return true;
  }
  if (!visible && bindingCount(block.workspace, id) > 1) {
    const own = map.createVariable(name, type).getId();
    block.setFieldValue(own, 'VAR');
    moveReaders(block, id, own);
    return true;
  }
  return false;
}

/** What a `let` that sets a binding above it says, or null. */
export function joinWarning(block: Blockly.Block): string | null {
  if (!isRedeclaration(block)) {
    return null;
  }
  const id = block.getFieldValue('VAR') as string;
  const name = block.workspace.getVariableMap().getVariableById(id)?.getName();
  return `${name} is already known here, so this sets it rather than making a new one.`;
}

const JOINED = 'joined';

/** Whether `block` is the one that moved, or sits inside it. */
function within(block: Blockly.Block, movedId: string | undefined): boolean {
  for (
    let at: Blockly.Block | null = block;
    at && movedId;
    at = at.getParent()
  ) {
    if (at.id === movedId) {
      return true;
    }
  }
  return false;
}

export const LET_BINDING_EXTENSION = 'world_let_binding';

export const letBindingExtension: Extension = defineExtension(
  LET_BINDING_EXTENSION,
  {
    extension() {
      const block = this as unknown as Blockly.Block;
      addOnChange(block, event => {
        if (block.isInFlyout || event.isUiEvent) {
          return;
        }
        const workspace = block.workspace as {isDragging?: () => boolean};
        if (workspace.isDragging?.()) {
          return;
        }
        const moved =
          event.type === Blockly.Events.BLOCK_MOVE &&
          within(block, (event as {blockId?: string}).blockId);
        if (moved) {
          const group = Blockly.Events.getGroup();
          Blockly.Events.setGroup(event.group || group || true);
          try {
            settleLet(block);
          } finally {
            Blockly.Events.setGroup(group);
          }
        }
        block.setWarningText?.(joinWarning(block), JOINED);
      });
    },
  },
);
