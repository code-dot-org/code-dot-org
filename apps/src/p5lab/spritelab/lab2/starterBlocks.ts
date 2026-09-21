// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in.

import * as BlocklyCore from 'blockly/core';

export type StarterBlock = BlocklyCore.serialization.blocks.State;

// Below the existing stacks, with room for a couple more blocks under them
// before the starter begins.
const ROOM_BELOW_PX = 96;

/** The starters whose type no block in the workspace already has. */
export function missingStarters(
  presentTypes: Iterable<string>,
  starters: StarterBlock[]
): StarterBlock[] {
  const present = new Set(presentTypes);
  return starters.filter(starter => !present.has(starter.type));
}

/** Where the next starter begins: under the lowest stack's bottom edge, at
    the leftmost stack's x. An empty workspace starts at the origin. */
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
 * Add the level's starter blocks the workspace lacks, each placed below
 * everything already there. Returns how many were added. Fires ordinary
 * create events, so the workspace saves and re-runs as after an edit.
 */
export function addStarterBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  starters: StarterBlock[]
): number {
  const missing = missingStarters(
    workspace.getAllBlocks(false).map(block => block.type),
    starters
  );
  let added = 0;
  for (const starter of missing) {
    const stacks = workspace.getTopBlocks(false).map(block => {
      const {x, y} = block.getRelativeToSurfaceXY();
      return {x, y, height: block.getHeightWidth().height};
    });
    const {x, y} = placeBelow(stacks);
    try {
      BlocklyCore.serialization.blocks.append({...starter, x, y}, workspace, {
        recordUndo: false,
      });
      added++;
    } catch (e) {
      // A starter the block pool cannot build (a misnamed input, a missing
      // type) is a level-authoring slip; the level must still open.
      console.warn(`starter block ${starter.type} not added:`, e);
    }
  }
  return added;
}
