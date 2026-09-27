// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in; and
// placeholders it hangs on stacks that are already there.

import * as BlocklyCore from 'blockly/core';

export type AddBlock = BlocklyCore.serialization.blocks.State;

/**
 * A shadow hung on the end of a stack already in the workspace: the
 * level's placeholder for the block a student adds under when-run, or
 * under an event an earlier level had them build.
 */
export interface AttachShadow {
  /** The type of the stack's top block. */
  attachTo: string;
  shadow: BlocklyCore.serialization.blocks.State;
}

export type AddBlockEntry = AddBlock | AttachShadow;

export function isAttachShadow(entry: AddBlockEntry): entry is AttachShadow {
  return 'attachTo' in entry;
}

// Below the existing stacks, with room for three more blocks under them
// before the added block begins: the blocks later levels have the student
// add under when-run.
const ROOM_BELOW_PX = 144;

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

/** The connection under a stack's last real block, if it is free: no
    block on it and no shadow recorded for it. A shadow at the end is a
    placeholder already hung there, and getNextBlock returns shadows too,
    so the walk stops at one. A shadow stays recorded while a real block
    covers it, so a filled placeholder is not hung twice either. */
export function freeStackEnd(
  top: BlocklyCore.Block
): BlocklyCore.Connection | null {
  let last = top;
  for (let next = last.getNextBlock(); next; next = last.getNextBlock()) {
    if (next.isShadow()) {
      return null;
    }
    last = next;
  }
  const connection = last.nextConnection;
  if (!connection || connection.targetBlock() || connection.getShadowState()) {
    return null;
  }
  return connection;
}

/**
 * Hang the shadow on the end of the first stack whose top block has the
 * type. Returns whether it was hung: a missing stack, or a stack whose end
 * is taken, hangs nothing.
 */
export function attachShadow(
  workspace: BlocklyCore.Workspace,
  entry: AttachShadow
): boolean {
  const top = workspace
    .getTopBlocks(false)
    .find(block => block.type === entry.attachTo);
  const connection = top && freeStackEnd(top);
  if (!connection) {
    return false;
  }
  connection.setShadowState(entry.shadow);
  return true;
}

/**
 * Add the level's blocks the workspace lacks, each placed below
 * everything already there, and hang its shadows on the stacks named for
 * them. Returns how many were added. Fires ordinary create events, so
 * the workspace saves and re-runs as after an edit.
 */
export function addMissingBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  entries: AddBlockEntry[]
): number {
  const blocks = entries.filter(
    (entry): entry is AddBlock => !isAttachShadow(entry)
  );
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
  for (const entry of entries) {
    if (isAttachShadow(entry)) {
      try {
        if (attachShadow(workspace, entry)) {
          added++;
        }
      } catch (e) {
        console.warn(`add_blocks shadow for ${entry.attachTo} not hung:`, e);
      }
    }
  }
  return added;
}
