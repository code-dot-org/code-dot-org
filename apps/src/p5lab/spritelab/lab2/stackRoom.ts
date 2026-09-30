import * as BlocklyCore from 'blockly/core';

// Between one stack's bottom and the next stack's top: one plain block's
// height, so there is always somewhere to drop the next block.
export const STACK_GAP_PX = 34;

export interface StackBox {
  x: number;
  y: number;
  width: number;
  height: number;
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

function stackBox(block: BlocklyCore.BlockSvg): StackBox {
  const {x, y} = block.getRelativeToSurfaceXY();
  const {width, height} = block.getHeightWidth();
  return {x, y, width, height, moveBy: (dx, dy) => block.moveBy(dx, dy)};
}

const pending = new WeakSet<BlocklyCore.WorkspaceSvg>();

/**
 * Make room under every stack once the workspace has finished rendering.
 * Calls made while one is waiting fold into it. The moves are not undoable:
 * a student's undo should take back their edit, not the tidying.
 */
export function ensureRoom(workspace: BlocklyCore.WorkspaceSvg): void {
  if (pending.has(workspace)) {
    return;
  }
  pending.add(workspace);
  // A placeholder takes its block's shape in a second render pass, so
  // heights are final one tick after the queue drains.
  BlocklyCore.renderManagement
    .finishQueuedRenders()
    .then(() => new Promise(resolve => setTimeout(resolve)))
    .then(() => {
      pending.delete(workspace);
      if (workspace.isDragging() || !workspace.rendered) {
        return;
      }
      const stacks = workspace.getTopBlocks(false).map(stackBox);
      const recordUndo = BlocklyCore.Events.getRecordUndo();
      BlocklyCore.Events.setRecordUndo(false);
      try {
        makeRoom(stacks, STACK_GAP_PX);
      } finally {
        BlocklyCore.Events.setRecordUndo(recordUndo);
      }
    });
}

/**
 * Keep room under the stacks as the workspace changes: after code loads,
 * after a block is added, and after a block joins a stack. Dragging a
 * stack somewhere is the student's placement and is left alone. Returns
 * the function that stops watching.
 */
export function watchStackRoom(
  workspace: BlocklyCore.WorkspaceSvg
): () => void {
  const onChange = (event: BlocklyCore.Events.Abstract) => {
    const joined =
      event.type === BlocklyCore.Events.BLOCK_MOVE &&
      !!(event as BlocklyCore.Events.BlockMove).newParentId;
    if (
      joined ||
      event.type === BlocklyCore.Events.FINISHED_LOADING ||
      event.type === BlocklyCore.Events.BLOCK_CREATE
    ) {
      ensureRoom(workspace);
    }
  };
  workspace.addChangeListener(onChange);
  return () => workspace.removeChangeListener(onChange);
}
