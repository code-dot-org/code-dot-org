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

// A stack: any top block that is not a value block. Loose value blocks are
// left to Blockly.
function isStack(block: BlocklyCore.Block): boolean {
  return !block.outputConnection;
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

// Workspaces whose stacks Blockly must not bump, shared by every copy of
// this module the dev server has loaded.
const QUIET_KEY = Symbol.for('spritelab2.quietStackBumps');
const quiet: WeakSet<BlocklyCore.Workspace> = ((
  globalThis as Record<symbol, unknown>
)[QUIET_KEY] ??= new WeakSet()) as WeakSet<BlocklyCore.Workspace>;

/**
 * Whether Blockly's nudge of `moving` away from `superior` would move a
 * stack of a quiet workspace. Blockly moves the root of `moving`, or the
 * root of `superior` when that one is pinned.
 */
export function quietsBump(
  moving: BlocklyCore.RenderedConnection,
  superior: BlocklyCore.RenderedConnection
): boolean {
  const block = moving.getSourceBlock();
  if (!quiet.has(block.workspace)) {
    return false;
  }
  let root = block.getRootBlock();
  if (!root.isMovable()) {
    root = superior.getSourceBlock().getRootBlock();
  }
  return isStack(root);
}

type BumpAwayFrom = BlocklyCore.RenderedConnection['bumpAwayFrom'];

// Blockly nudges an unconnected block aside whenever a connection lands
// within the snap radius of it, on every render; for stacks, the pass
// makes the room instead.
function quietStackBumps(workspace: BlocklyCore.Workspace): () => void {
  const proto = BlocklyCore.RenderedConnection.prototype;
  const current = proto.bumpAwayFrom as BumpAwayFrom & {quietsStacks?: true};
  if (!current.quietsStacks) {
    const quieted: BumpAwayFrom & {quietsStacks?: true} = function (
      this: BlocklyCore.RenderedConnection,
      ...args
    ) {
      if (!quietsBump(this, args[0])) {
        current.apply(this, args);
      }
    };
    quieted.quietsStacks = true;
    proto.bumpAwayFrom = quieted;
  }
  quiet.add(workspace);
  return () => quiet.delete(workspace);
}

/** Keep room under the stacks as the workspace changes. A dropped stack
    keeps its place, except that one overlapping the stack above it in its
    column slides down under it. Returns the function that stops watching. */
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
