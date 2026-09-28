// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in.

import * as BlocklyCore from 'blockly/core';

export type AddBlock = BlocklyCore.serialization.blocks.State;

// Below the existing stacks, with room for a couple more blocks under them
// before the added block begins.
const ROOM_BELOW_PX = 96;

/** The blocks whose type no block in the workspace already has. */
export function missingBlocks(
  presentTypes: Iterable<string>,
  blocks: AddBlock[]
): AddBlock[] {
  const present = new Set(presentTypes);
  return blocks.filter(block => !present.has(block.type));
}

/** Where the next added block begins: under the lowest stack's bottom
    edge, at the leftmost stack's x. An empty workspace starts at the
    origin. */
export function placeBelow(stacks: {x: number; y: number; height: number}[]): {
  x: number;
  y: number;
} {
  if (stacks.length === 0) {
    return {x: 0, y: 0};
  }
  return {
    x: Math.min(...stacks.map(s => s.x)),
    y: Math.max(...stacks.map(s => s.y + s.height)) + ROOM_BELOW_PX,
  };
}

/**
 * Add the level's blocks the workspace lacks, each placed below
 * everything already there. Returns how many were added. Fires ordinary
 * create events, so the workspace saves and re-runs as after an edit.
 */
export function addMissingBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  blocks: AddBlock[]
): number {
  const missing = missingBlocks(
    workspace.getAllBlocks(false).map(block => block.type),
    blocks
  );
  let added = 0;
  for (const entry of missing) {
    const stacks = workspace.getTopBlocks(false).map(top => {
      const {x, y} = top.getRelativeToSurfaceXY();
      return {x, y, height: top.getHeightWidth().height};
    });
    const {x, y} = placeBelow(stacks);
    try {
      BlocklyCore.serialization.blocks.append({...entry, x, y}, workspace, {
        recordUndo: false,
      });
      added++;
    } catch (e) {
      // A block the pool cannot build (a misnamed input, a missing type) is
      // a level-authoring slip; the level must still open.
      console.warn(`add_blocks entry ${entry.type} not added:`, e);
    }
  }
  return added;
}
