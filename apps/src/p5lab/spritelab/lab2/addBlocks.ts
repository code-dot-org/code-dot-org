// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in; and
// placeholders it hangs on stacks that are already there.

import * as BlocklyCore from 'blockly/core';

import {scrollIntoView} from './scrollIntoView';

/** A block to add. Its `data`, when set, is the tag a workspace block must
    carry to stand for it. */
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

// Between one stack's bottom and the next stack's top.
const STACK_GAP_PX = 24;

/** A block in the workspace as the matcher sees it. */
export interface PresentBlock {
  type: string;
  data?: string | null;
}

/** Whether a workspace block stands for an entry: the entry's type, and the
    entry's tag when it has one. The tag, not the block's values, is the
    identity, so a block the student edited still stands for its entry and
    a block of the type the student built does not. */
export function matchesEntry(present: PresentBlock, entry: AddBlock): boolean {
  return (
    present.type === entry.type && (!entry.data || present.data === entry.data)
  );
}

/** The blocks the workspace lacks (see matchesEntry). */
export function missingBlocks(
  present: Iterable<PresentBlock>,
  blocks: AddBlock[]
): AddBlock[] {
  const presentBlocks = Array.from(present);
  return blocks.filter(
    block => !presentBlocks.some(p => matchesEntry(p, block))
  );
}

/** Where the next added block begins: a gap under the lowest stack, at
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
    y: Math.max(...stacks.map(s => s.y + s.height)) + STACK_GAP_PX,
  };
}

interface StackBox {
  x: number;
  y: number;
  width: number;
  height: number;
  moveBy: (dx: number, dy: number) => void;
}

/**
 * Move the stacks below a stack that just grew down until each clears the
 * one above it by the gap. Only stacks in its column: one a student parked
 * off to the side is left where it is.
 */
export function makeRoomBelow(grown: StackBox, others: StackBox[]): void {
  const below = others
    .filter(
      s =>
        s.y > grown.y && s.x < grown.x + grown.width && s.x + s.width > grown.x
    )
    .sort((a, b) => a.y - b.y);
  let floor = grown.y + grown.height + STACK_GAP_PX;
  for (const stack of below) {
    if (stack.y < floor) {
      stack.moveBy(0, floor - stack.y);
      stack.y = floor;
    }
    floor = stack.y + stack.height + STACK_GAP_PX;
  }
}

function stackBox(block: BlocklyCore.BlockSvg): StackBox {
  const {x, y} = block.getRelativeToSurfaceXY();
  const {width, height} = block.getHeightWidth();
  return {x, y, width, height, moveBy: (dx, dy) => block.moveBy(dx, dy)};
}

type Shadow = BlocklyCore.serialization.blocks.State;

// Placeholders are told apart by the block they stand in for, fields
// included: two levels may each want a make-new-sprite, one left, one right.
function likeKey(shadow: Shadow | null | undefined): string | undefined {
  const like = (
    shadow?.extraState as {like?: {type?: string; fields?: unknown}} | undefined
  )?.like;
  return like && JSON.stringify([like.type, like.fields ?? null]);
}

function samePlaceholder(a: Shadow | null | undefined, b: Shadow): boolean {
  return !!a && a.type === b.type && likeKey(a) === likeKey(b);
}

/**
 * The connection under a stack's last real block, if `shadow` can hang
 * there. Blockly keeps a connection's shadow recorded while a real block
 * covers it, so a stack that already had this placeholder, filled in or
 * not, gets it nowhere else.
 */
export function freeStackEnd(
  top: BlocklyCore.Block,
  shadow: Shadow
): BlocklyCore.Connection | null {
  for (let block: BlocklyCore.Block = top; ; ) {
    const connection = block.nextConnection;
    if (!connection || samePlaceholder(connection.getShadowState(), shadow)) {
      return null;
    }
    const next = connection.targetBlock();
    if (!next) {
      return connection.getShadowState() ? null : connection;
    }
    if (next.isShadow()) {
      return null;
    }
    block = next;
  }
}

/** The shadow a stack ends in, an outline still waiting for its block, with
    the connection it hangs from; null when the stack ends in a real block. */
export function trailingShadow(top: BlocklyCore.Block): {
  connection: BlocklyCore.Connection;
  shadow: BlocklyCore.Block;
} | null {
  for (let block: BlocklyCore.Block = top; ; ) {
    const connection = block.nextConnection;
    const next = connection?.targetBlock();
    if (!connection || !next) {
      return null;
    }
    if (next.isShadow()) {
      return {connection, shadow: next};
    }
    block = next;
  }
}

/** The stacks still ending in one of the level's placeholders: under a
    block the level adds, or on the stack the level hangs it on. An entry
    with no placeholder has no outline to wait for. */
export function unfilledOutlines(
  workspace: BlocklyCore.WorkspaceSvg,
  entries: AddBlockEntry[]
): BlocklyCore.BlockSvg[] {
  const tops = workspace.getTopBlocks(false);
  const found = new Set<BlocklyCore.BlockSvg>();
  for (const entry of entries) {
    const placeholder = isAttachShadow(entry)
      ? entry.shadow
      : entry.next?.shadow;
    if (!placeholder) {
      continue;
    }
    for (const top of tops) {
      const end = trailingShadow(top);
      const matches = isAttachShadow(entry)
        ? top.type === entry.attachTo
        : matchesEntry(top, entry);
      if (
        end &&
        matches &&
        samePlaceholder(end.connection.getShadowState(), placeholder)
      ) {
        found.add(top);
      }
    }
  }
  return [...found];
}

/** Hang the shadow on the first stack of the type with a free end, and
    move the stacks below it out of its way; returns that stack, or null. */
export function attachShadow(
  workspace: BlocklyCore.WorkspaceSvg,
  entry: AttachShadow
): BlocklyCore.BlockSvg | null {
  for (const top of workspace.getTopBlocks(false)) {
    if (top.type !== entry.attachTo) {
      continue;
    }
    const connection = freeStackEnd(top, entry.shadow);
    if (connection) {
      connection.setShadowState(entry.shadow);
      // The placeholder takes its block's shape in a second render pass, so
      // the stack's new height is known one tick after the queue drains.
      BlocklyCore.renderManagement
        .finishQueuedRenders()
        .then(() => new Promise(resolve => setTimeout(resolve)))
        .then(() => {
          if (!top.isDisposed()) {
            const others = workspace
              .getTopBlocks(false)
              .filter(other => other !== top);
            makeRoomBelow(stackBox(top), others.map(stackBox));
          }
        });
      return top;
    }
  }
  return null;
}

/**
 * Add the level's blocks the workspace lacks, each placed below
 * everything already there, and hang its shadows on the stacks named for
 * them. Returns how many were added. Fires ordinary create events, so
 * the workspace saves and re-runs as after an edit. Then scrolls what was
 * added, and any outline of the level's still waiting for its block, into
 * view, so a pass with nothing to add still shows the student their task.
 */
export function addMissingBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  entries: AddBlockEntry[]
): number {
  const blocks = entries.filter(
    (entry): entry is AddBlock => !isAttachShadow(entry)
  );
  const present = workspace.getAllBlocks(false).filter(b => !b.isShadow());
  const missing = missingBlocks(present, blocks);
  const added: BlocklyCore.BlockSvg[] = [];
  for (const entry of missing) {
    const stacks = workspace.getTopBlocks(false).map(top => {
      const {x, y} = top.getRelativeToSurfaceXY();
      return {x, y, height: top.getHeightWidth().height};
    });
    const {x, y} = placeBelow(stacks);
    try {
      const block = BlocklyCore.serialization.blocks.append(
        {...entry, x, y},
        workspace,
        {recordUndo: false}
      );
      // Rendered now, so the next entry is placed under its real height.
      BlocklyCore.renderManagement.triggerQueuedRenders(workspace);
      added.push(block as BlocklyCore.BlockSvg);
    } catch (e) {
      // A block the pool cannot build (a misnamed input, a missing type) is
      // a level-authoring slip; the level must still open.
      console.warn(`add_blocks entry ${entry.type} not added:`, e);
    }
  }
  for (const entry of entries) {
    if (isAttachShadow(entry)) {
      try {
        const top = attachShadow(workspace, entry);
        if (top) {
          added.push(top);
        }
      } catch (e) {
        console.warn(`add_blocks shadow for ${entry.attachTo} not hung:`, e);
      }
    }
  }
  const show = new Set(added);
  for (const top of unfilledOutlines(workspace, entries)) {
    show.add(top);
  }
  showBlocks(workspace, [...show]);
  return added.length;
}

// Scroll the blocks on screen: a long program can leave them below the
// fold of a small screen.
async function showBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  blocks: BlocklyCore.BlockSvg[]
): Promise<void> {
  if (!blocks.length) {
    return;
  }
  await BlocklyCore.renderManagement.finishQueuedRenders();
  // A hung placeholder sizes itself a tick after the renders run.
  await new Promise(resolve => setTimeout(resolve));
  const live = blocks.filter(block => !block.isDisposed());
  if (!live.length) {
    return;
  }
  const rects = live.map(block => block.getBoundingRectangle());
  scrollIntoView(
    workspace,
    {
      top: Math.min(...rects.map(r => r.top)),
      bottom: Math.max(...rects.map(r => r.bottom)),
      left: Math.min(...rects.map(r => r.left)),
      right: Math.max(...rects.map(r => r.right)),
    },
    STACK_GAP_PX
  );
}
