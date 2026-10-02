import * as BlocklyCore from 'blockly/core';

// Between one stack's bottom and the next stack's top: one plain block's
// height, so there is always somewhere to drop the next block.
export const STACK_GAP_PX = 34;

// The event group of the pass's own moves. They are tidying, not an edit:
// the workspace hook does not save or re-run on them, and the pass does not
// act on them.
export const STACK_ROOM_EVENT_GROUP = 'stack-room';

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
  for (let i = 0; i < ordered.length; i++) {
    const stack = ordered[i];
    if (stack.fixed) {
      continue;
    }
    let top = stack.y;
    for (let j = 0; j < i; j++) {
      const above = ordered[j];
      if (above.x < stack.x + stack.width && above.x + above.width > stack.x) {
        top = Math.max(top, above.y + above.height + room);
      }
    }
    if (top > stack.y) {
      stack.moveBy(0, top - stack.y);
      stack.y = top;
    }
  }
}

/** A top block's stack as a box on the workspace. */
export function measureStack(block: BlocklyCore.BlockSvg): {
  x: number;
  y: number;
  width: number;
  height: number;
} {
  const {x, y} = block.getRelativeToSurfaceXY();
  const {width, height} = block.getHeightWidth();
  return {x, y, width, height};
}

function stackBox(block: BlocklyCore.BlockSvg, pinned: Set<string>): StackBox {
  return {
    ...measureStack(block),
    fixed: !block.isMovable() || pinned.has(block.id),
    moveBy: (dx, dy) => block.moveBy(dx, dy),
  };
}

// Stacks the waiting pass must not move, by top block id; a pass is
// waiting while its workspace has an entry.
const pendingPins = new WeakMap<BlocklyCore.WorkspaceSvg, Set<string>>();

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
      tidy(() => makeRoom(stacks, STACK_GAP_PX));
    });
}

// Run moves as the pass's own: not undoable, and in `group`.
function tidy(moves: () => void, group = STACK_ROOM_EVENT_GROUP): void {
  const recordUndo = BlocklyCore.Events.getRecordUndo();
  const outerGroup = BlocklyCore.Events.getGroup();
  BlocklyCore.Events.setRecordUndo(false);
  BlocklyCore.Events.setGroup(group);
  try {
    moves();
  } finally {
    BlocklyCore.Events.setGroup(outerGroup);
    BlocklyCore.Events.setRecordUndo(recordUndo);
  }
}

// Put a bumped stack back for the pass to make room below it; with nothing
// above it in its column the pass could not, so the bump stands.
function undoBump(
  workspace: BlocklyCore.WorkspaceSvg,
  move: BlocklyCore.Events.BlockMove
): boolean {
  const block = move.blockId ? workspace.getBlockById(move.blockId) : null;
  const from = move.oldCoordinate;
  if (!block || !from) {
    return false;
  }
  const {width} = block.getHeightWidth();
  const hasAbove = workspace.getTopBlocks(false).some(other => {
    const box = measureStack(other);
    return (
      other !== block &&
      box.y < from.y &&
      box.x < from.x + width &&
      box.x + box.width > from.x
    );
  });
  if (!hasAbove) {
    return false;
  }
  // In the bump's own group, so the workspace hook saves this position and
  // not the bumped one.
  tidy(
    () => block.moveTo(new BlocklyCore.utils.Coordinate(from.x, from.y)),
    move.group
  );
  return true;
}

/**
 * Keep room under the stacks as the workspace changes: after code loads,
 * after a block is added or edited, after a block joins a stack, and after
 * a student drags a stack somewhere. The dragged stack is their placement
 * and stays where they put it; the stacks below it make way. Returns the
 * function that stops watching.
 */
export function watchStackRoom(
  workspace: BlocklyCore.WorkspaceSvg,
  schedule: typeof ensureRoom = ensureRoom
): () => void {
  // The stack the student last dragged; Blockly's bump of it is still
  // their placement.
  let dragged: string | null = null;
  const onChange = (event: BlocklyCore.Events.Abstract) => {
    if (event.group === STACK_ROOM_EVENT_GROUP) {
      return;
    }
    if (event.type === BlocklyCore.Events.FINISHED_LOADING) {
      dragged = null;
    }
    // A field edit can make a block taller without moving anything.
    if (
      event.type === BlocklyCore.Events.FINISHED_LOADING ||
      event.type === BlocklyCore.Events.BLOCK_CREATE ||
      event.type === BlocklyCore.Events.BLOCK_CHANGE
    ) {
      schedule(workspace);
      return;
    }
    if (event.type !== BlocklyCore.Events.BLOCK_MOVE) {
      return;
    }
    const move = event as BlocklyCore.Events.BlockMove;
    if (move.newParentId) {
      schedule(workspace);
      return;
    }
    // Undo and redo replay moves with their original reasons.
    if (!move.blockId || !move.reason || !move.recordUndo) {
      return;
    }
    if (move.reason.includes('drag')) {
      dragged = move.blockId;
      schedule(workspace, move.blockId);
    } else if (move.reason.includes('bump')) {
      if (move.blockId !== dragged && undoBump(workspace, move)) {
        schedule(workspace);
      } else {
        schedule(workspace, move.blockId);
      }
    }
  };
  workspace.addChangeListener(onChange);
  return () => workspace.removeChangeListener(onChange);
}
