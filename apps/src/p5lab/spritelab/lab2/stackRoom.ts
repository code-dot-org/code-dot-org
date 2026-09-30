import * as BlocklyCore from 'blockly/core';

// Between one stack's bottom and the next stack's top: one plain block's
// height, so there is always somewhere to drop the next block.
export const STACK_GAP_PX = 34;

export interface StackBox {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Stays put (pinned by the level, or just placed by the student) but
      still pushes the stacks below it. */
  fixed?: boolean;
  moveBy: (dx: number, dy: number) => void;
}

/**
 * Move stacks down, top to bottom, until every stack has `room` below it
 * before the next stack in its column. A stack only ever moves down, and
 * only for stacks above it that share its column, so one a student parked
 * off to the side is left where it is.
 */
export function makeRoom(stacks: StackBox[], room: number): void {
  const ordered = [...stacks].sort((a, b) => a.y - b.y || a.x - b.x);
  ordered.forEach((stack, i) => {
    if (stack.fixed) {
      return;
    }
    let top = stack.y;
    for (const above of ordered.slice(0, i)) {
      if (above.x < stack.x + stack.width && above.x + above.width > stack.x) {
        top = Math.max(top, above.y + above.height + room);
      }
    }
    if (top > stack.y) {
      stack.moveBy(0, top - stack.y);
      stack.y = top;
    }
  });
}

function stackBox(block: BlocklyCore.BlockSvg, pinned: Set<string>): StackBox {
  const {x, y} = block.getRelativeToSurfaceXY();
  const {width, height} = block.getHeightWidth();
  return {
    x,
    y,
    width,
    height,
    fixed: !block.isMovable() || pinned.has(block.id),
    moveBy: (dx, dy) => block.moveBy(dx, dy),
  };
}

// Stacks the waiting pass must not move, by top block id; a pass is
// waiting while its workspace has an entry.
const pendingPins = new WeakMap<BlocklyCore.WorkspaceSvg, Set<string>>();
// Workspaces whose stacks the pass is moving right now.
const applying = new WeakSet<BlocklyCore.WorkspaceSvg>();

/**
 * Make room under every stack once the workspace has finished rendering.
 * Calls made while one is waiting fold into it, pins included. The moves
 * are not undoable: a student's undo should take back their edit, not the
 * tidying.
 */
export function ensureRoom(
  workspace: BlocklyCore.WorkspaceSvg,
  pinnedBlockId?: string
): void {
  const pins = pendingPins.get(workspace);
  if (pins) {
    if (pinnedBlockId) {
      pins.add(pinnedBlockId);
    }
    return;
  }
  pendingPins.set(workspace, new Set(pinnedBlockId ? [pinnedBlockId] : []));
  // A placeholder takes its block's shape in a second render pass, so
  // heights are final one tick after the queue drains.
  BlocklyCore.renderManagement
    .finishQueuedRenders()
    .then(() => new Promise(resolve => setTimeout(resolve)))
    .then(() => {
      const pinned = pendingPins.get(workspace) ?? new Set<string>();
      pendingPins.delete(workspace);
      if (workspace.isDragging() || !workspace.rendered) {
        return;
      }
      const stacks = workspace
        .getTopBlocks(false)
        .map(block => stackBox(block, pinned));
      const recordUndo = BlocklyCore.Events.getRecordUndo();
      BlocklyCore.Events.setRecordUndo(false);
      applying.add(workspace);
      try {
        makeRoom(stacks, STACK_GAP_PX);
      } finally {
        applying.delete(workspace);
        BlocklyCore.Events.setRecordUndo(recordUndo);
      }
    });
}

/**
 * Keep room under the stacks as the workspace changes: after code loads,
 * after a block is added, after a block joins a stack, and after a student
 * drags a stack somewhere. The dragged stack is their placement and stays
 * where they put it; the stacks below it make way. Returns the function
 * that stops watching.
 */
export function watchStackRoom(
  workspace: BlocklyCore.WorkspaceSvg
): () => void {
  const onChange = (event: BlocklyCore.Events.Abstract) => {
    if (applying.has(workspace)) {
      return;
    }
    if (
      event.type === BlocklyCore.Events.FINISHED_LOADING ||
      event.type === BlocklyCore.Events.BLOCK_CREATE
    ) {
      ensureRoom(workspace);
      return;
    }
    if (event.type !== BlocklyCore.Events.BLOCK_MOVE) {
      return;
    }
    const move = event as BlocklyCore.Events.BlockMove;
    if (move.newParentId) {
      ensureRoom(workspace);
    } else if (move.reason?.includes('drag') && move.blockId) {
      ensureRoom(workspace, move.blockId);
    }
  };
  workspace.addChangeListener(onChange);
  return () => workspace.removeChangeListener(onChange);
}
