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
  /** Pinned by the level: stays put, but still pushes the stacks below it. */
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

/** A stack of statement blocks: a hat, or a block with a top or bottom
    connection. Loose value blocks are left to Blockly. */
export function isStack(block: BlocklyCore.Block): boolean {
  return !!(block.previousConnection || block.nextConnection);
}

function stackBox(block: BlocklyCore.BlockSvg): StackBox {
  return {
    ...measureStack(block),
    fixed: !block.isMovable(),
    moveBy: (dx, dy) => block.moveBy(dx, dy),
  };
}

// Workspaces with a pass waiting.
const pending = new WeakSet<BlocklyCore.WorkspaceSvg>();

/**
 * Make room under every stack once the workspace has finished rendering.
 * Calls made while one is waiting fold into it. The moves are not
 * undoable: a student's undo should take back their edit, not the tidying.
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
      const stacks = workspace
        .getTopBlocks(false)
        .filter(isStack)
        .map(stackBox);
      tidy(() => makeRoom(stacks, STACK_GAP_PX));
    });
}

// Run moves as the pass's own: not undoable, and in the pass's group.
function tidy(moves: () => void): void {
  const recordUndo = BlocklyCore.Events.getRecordUndo();
  const group = BlocklyCore.Events.getGroup();
  BlocklyCore.Events.setRecordUndo(false);
  BlocklyCore.Events.setGroup(STACK_ROOM_EVENT_GROUP);
  try {
    moves();
  } finally {
    BlocklyCore.Events.setGroup(group);
    BlocklyCore.Events.setRecordUndo(recordUndo);
  }
}

// Workspaces whose stacks Blockly must not bump (see quietStackBumps).
const quiet = new WeakSet<BlocklyCore.Workspace>();

// Blockly nudges an unconnected block sideways and down whenever a
// connection ends up within the snap radius of it, on every render. Here
// the pass makes the room instead, so the bump is off for the stacks of a
// quiet workspace; loose value blocks keep it.
const blocklyBumpNeighbours = BlocklyCore.BlockSvg.prototype.bumpNeighbours;
BlocklyCore.BlockSvg.prototype.bumpNeighbours = function () {
  const root = this.getRootBlock();
  if (quiet.has(root.workspace) && isStack(root)) {
    return;
  }
  blocklyBumpNeighbours.call(this);
};

/** Stop Blockly bumping this workspace's stacks apart. Returns the
    function that lets it again. */
export function quietStackBumps(workspace: BlocklyCore.Workspace): () => void {
  quiet.add(workspace);
  return () => quiet.delete(workspace);
}

/**
 * Keep room under the stacks as the workspace changes: after code loads,
 * after a block is added or edited, after a block joins a stack, and after
 * a student drags a stack somewhere. A dropped stack keeps the place the
 * student gave it, except that one overlapping the stack above it in its
 * column slides down under that stack. Returns the function that stops
 * watching.
 */
export function watchStackRoom(
  workspace: BlocklyCore.WorkspaceSvg,
  schedule: typeof ensureRoom = ensureRoom
): () => void {
  const onChange = (event: BlocklyCore.Events.Abstract) => {
    if (event.group === STACK_ROOM_EVENT_GROUP) {
      return;
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
    if (move.newParentId || move.reason?.includes('drag')) {
      schedule(workspace);
    }
  };
  const letBump = quietStackBumps(workspace);
  workspace.addChangeListener(onChange);
  return () => {
    workspace.removeChangeListener(onChange);
    letBump();
  };
}
