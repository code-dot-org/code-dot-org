import * as BlocklyCore from 'blockly/core';

// Keys a load assigns afresh, or that listeners such as disableOrphans and
// the resize handler rewrite after a load. Neither is a student edit.
const VOLATILE_KEYS = [
  'id',
  'procedureId',
  'x',
  'y',
  'enabled',
  'disabledReasons',
];

type Json = null | boolean | number | string | Json[] | {[key: string]: Json};

function variableNames(state: Json): Map<string, string> {
  const names = new Map<string, string>();
  if (state && typeof state === 'object' && !Array.isArray(state)) {
    const variables = state.variables;
    if (Array.isArray(variables)) {
      for (const variable of variables) {
        if (
          variable &&
          typeof variable === 'object' &&
          !Array.isArray(variable)
        ) {
          const {id, name} = variable;
          if (typeof id === 'string' && typeof name === 'string') {
            names.set(id, name);
          }
        }
      }
    }
  }
  return names;
}

function strip(value: Json, names: Map<string, string>): Json {
  if (Array.isArray(value)) {
    return value.map(item => strip(item, names));
  }
  if (!value || typeof value !== 'object') {
    return value;
  }
  // A variable field is {id}; its name is what distinguishes one variable
  // from another once ids are dropped.
  const keys = Object.keys(value);
  if (
    keys.length === 1 &&
    typeof value.id === 'string' &&
    names.has(value.id)
  ) {
    return {variable: names.get(value.id) as string};
  }
  const out: {[key: string]: Json} = {};
  for (const key of keys.sort()) {
    if (!VOLATILE_KEYS.includes(key)) {
      out[key] = strip(value[key], names);
    }
  }
  return out;
}

/**
 * Reduces a serialized workspace to the content a student can edit, so two
 * loads of the same blocks compare equal.
 */
export function normalizeWorkspaceState(state: unknown): string {
  const json = state as Json;
  return JSON.stringify(strip(json, variableNames(json)));
}

/**
 * Key for the content of the main and hidden definition workspaces.
 */
export function startBlocksStateKey(): string {
  return [Blockly.mainBlockSpace, Blockly.getHiddenDefinitionWorkspace?.()]
    .map(workspace =>
      workspace
        ? normalizeWorkspaceState(
            Blockly.serialization.workspaces.save(workspace)
          )
        : ''
    )
    .join('\n');
}

/**
 * True while the student is mid-gesture or has an editor open; reloading the
 * workspace then would tear the editor or the dragged block out from under
 * them.
 */
export function isWorkspaceBusy(): boolean {
  const main = Blockly.mainBlockSpace;
  return !!(
    main?.isDragging?.() ||
    BlocklyCore.WidgetDiv.isVisible() ||
    BlocklyCore.DropDownDiv.isVisible() ||
    Blockly.functionEditor?.isOpen?.()
  );
}

type TopBlockPosition = {type: string; x: number; y: number};

export function saveTopBlockPositions(
  workspace: BlocklyCore.WorkspaceSvg
): TopBlockPosition[] {
  return workspace.getTopBlocks(false).map(block => {
    const xy = block.getRelativeToSurfaceXY();
    return {type: block.type, x: xy.x, y: xy.y};
  });
}

/**
 * Puts top blocks back where they were, matched by load order. A position is
 * not content, so moving a block does not count as an edit, and a reload must
 * not undo the move. Nothing moves unless the block types line up.
 */
export function restoreTopBlockPositions(
  workspace: BlocklyCore.WorkspaceSvg,
  positions: TopBlockPosition[]
): void {
  const blocks = workspace.getTopBlocks(false);
  if (
    blocks.length !== positions.length ||
    blocks.some((block, i) => block.type !== positions[i].type)
  ) {
    return;
  }
  blocks.forEach((block, i) => {
    const xy = block.getRelativeToSurfaceXY();
    block.moveBy(positions[i].x - xy.x, positions[i].y - xy.y);
  });
}
