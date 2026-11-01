// Paste and Duplicate give a copied binding a variable of its own.
//
// A copy carries its bindings' variable ids, and pasting it as it is would
// make the copy and the original share a variable: one name, renamed
// together (specs/VARIABLE_OWNERSHIP_PLAN.md). Each binding in the copy is
// given a fresh id, and the readers in the copy follow it. A reader whose
// binding was not copied keeps its id.

import * as Blockly from 'blockly/core';

import {isLocalField} from './fields/eventLocal';
import {BINDERS} from './variableScope';

type State = Blockly.serialization.blocks.State;

interface Fresh {
  id: string;
  name: string;
  type: string;
}

/** Every block in a serialised tree, the top one first. */
function blocksIn(state: State): State[] {
  const found: State[] = [state];
  for (const input of Object.values(state.inputs ?? {})) {
    for (const child of [input.block, input.shadow]) {
      if (child) {
        found.push(...blocksIn(child));
      }
    }
  }
  for (const child of [state.next?.block, state.next?.shadow]) {
    if (child) {
      found.push(...blocksIn(child));
    }
  }
  return found;
}

const idOf = (value: unknown): string | undefined =>
  typeof value === 'string'
    ? value
    : value && typeof value === 'object' && 'id' in value
      ? String((value as {id: unknown}).id)
      : undefined;

/** The copy, with fresh ids for what it binds; and the variables to make. */
export function freshBindings(
  state: State,
  workspace: Blockly.Workspace,
): {state: State; fresh: Fresh[]} {
  const copy = structuredClone(state);
  const blocks = blocksIn(copy);
  const map = workspace.getVariableMap();
  const renamed = new Map<string, Fresh>();
  for (const block of blocks) {
    const binds = [
      ...(BINDERS[block.type]?.fields ?? []),
      ...Object.keys(block.fields ?? {}).filter(isLocalField),
    ];
    for (const field of binds) {
      const value = block.fields?.[field];
      const id = idOf(value);
      if (!id || renamed.has(id)) {
        continue;
      }
      const known = map.getVariableById(id);
      const saved = (value ?? {}) as {name?: string; type?: string};
      const name = saved.name ?? known?.getName();
      if (name === undefined) {
        continue;
      }
      renamed.set(id, {
        id: Blockly.utils.idGenerator.genUid(),
        name,
        type: saved.type ?? known?.getType() ?? '',
      });
    }
  }
  for (const block of blocks) {
    for (const [field, value] of Object.entries(block.fields ?? {})) {
      const fresh = renamed.get(idOf(value) ?? '');
      if (!fresh) {
        continue;
      }
      block.fields![field] =
        typeof value === 'string'
          ? fresh.id
          : {...(value as object), id: fresh.id};
    }
  }
  return {state: copy, fresh: [...renamed.values()]};
}

export class OwnedBlockPaster extends Blockly.clipboard.BlockPaster {
  override paste(
    copyData: Blockly.clipboard.BlockCopyData,
    workspace: Blockly.WorkspaceSvg,
    coordinate?: Blockly.utils.Coordinate,
  ): Blockly.BlockSvg | null {
    const {state, fresh} = freshBindings(copyData.blockState, workspace);
    // Made first, so the copy's fields find them by id and not by name.
    for (const variable of fresh) {
      workspace
        .getVariableMap()
        .createVariable(variable.name, variable.type, variable.id);
    }
    const pasted = super.paste(
      {...copyData, blockState: state},
      workspace,
      coordinate,
    );
    if (!pasted) {
      for (const variable of fresh) {
        const made = workspace.getVariableMap().getVariableById(variable.id);
        if (made) {
          workspace.getVariableMap().deleteVariable(made);
        }
      }
    }
    return pasted;
  }
}

let registered = false;

/** Make it the paster for blocks. Overwrites Blockly's own. */
export function registerOwnedPaster(): void {
  if (registered) {
    return;
  }
  registered = true;
  Blockly.registry.register(
    Blockly.registry.Type.PASTER,
    Blockly.clipboard.BlockPaster.TYPE,
    new OwnedBlockPaster() as never,
    true,
  );
}
