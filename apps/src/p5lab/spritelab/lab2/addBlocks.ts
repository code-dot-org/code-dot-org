// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in; and
// placeholders it hangs on stacks that are already there.

import * as BlocklyCore from 'blockly/core';

import {scrollIntoView} from './scrollIntoView';
import {
  clearRoom,
  ensureRoom,
  heightsSettled,
  measureStack,
  reserveRoom,
  STACK_GAP_PX,
} from './stackRoom';

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

/**
 * Empty room kept under a stack already in the workspace, where the student
 * is expected to attach a block. Nothing is drawn there: the gap itself is
 * the hint. The room closes once a block of the type is in the stack.
 */
export interface AttachRoom {
  /** The type of the stack's top block. */
  attachTo: string;
  /** The tag the top block must carry, when one stack of the type is
      meant: the `data` of the level's own entry for it. */
  data?: string;
  room: {type: string};
}

export type AddBlockEntry = AddBlock | AttachShadow | AttachRoom;

export function isAttachShadow(entry: AddBlockEntry): entry is AttachShadow {
  return 'attachTo' in entry && !('room' in entry);
}

export function isAttachRoom(entry: AddBlockEntry): entry is AttachRoom {
  return 'attachTo' in entry && 'room' in entry;
}

/** An entry that adds no block of its own: a placeholder shadow or empty
    room attached to a stack already in the workspace. */
export function isAttachment(
  entry: AddBlockEntry
): entry is AttachShadow | AttachRoom {
  return isAttachShadow(entry) || isAttachRoom(entry);
}

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

/** Whether a stack's top block is one this level added for the student to
    build on, matched by type and tag. */
export function ownsTop(entries: AddBlockEntry[], top: PresentBlock): boolean {
  return entries.some(
    entry => !isAttachment(entry) && matchesEntry(top, entry)
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

function isBlank(shadow: Shadow | null | undefined): boolean {
  return !!(shadow?.extraState as {blank?: boolean} | undefined)?.blank;
}

/**
 * The connection under a stack's last real block, if `shadow` can be
 * attached there. Blockly keeps a connection's shadow recorded even while a
 * real block covers it, so a stack that already received this placeholder,
 * filled in or not, gets it nowhere else. A saved project keeps the
 * placeholder as it was when the level drew it, so a placeholder still
 * empty whose blank flag no longer matches the level's is attached again
 * in its place.
 */
export function freeStackEnd(
  top: BlocklyCore.Block,
  shadow: Shadow
): BlocklyCore.Connection | null {
  for (let block: BlocklyCore.Block = top; ; ) {
    const connection = block.nextConnection;
    if (!connection) {
      return null;
    }
    const recorded = connection.getShadowState();
    const next = connection.targetBlock();
    if (samePlaceholder(recorded, shadow)) {
      const waiting = !next || next.isShadow();
      return waiting && isBlank(recorded) !== isBlank(shadow)
        ? connection
        : null;
    }
    if (!next) {
      return recorded ? null : connection;
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
      : isAttachRoom(entry)
      ? undefined
      : entry.next?.shadow;
    if (!placeholder) {
      continue;
    }
    for (const top of tops) {
      const end = trailingShadow(top);
      const matches = isAttachment(entry)
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
    make room under the stacks again; returns that stack, or null. */
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
      ensureRoom(workspace);
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
export async function addMissingBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  entries: AddBlockEntry[]
): Promise<number> {
  await heightsSettled();
  if (!workspace.rendered) {
    return 0;
  }
  // Reserved rooms belong to a level and the workspace is reused across
  // levels, so the previous level's rooms are dropped first.
  clearRoom(workspace);
  const blocks = entries.filter(
    (entry): entry is AddBlock => !isAttachment(entry)
  );
  const present = workspace.getAllBlocks(false).filter(b => !b.isShadow());
  const missing = missingBlocks(present, blocks);
  const added: BlocklyCore.BlockSvg[] = [];
  for (const entry of missing) {
    const {x, y} = placeBelow(workspace.getTopBlocks(false).map(measureStack));
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
    } else if (isAttachRoom(entry)) {
      reserveRoom(workspace, {
        attachTo: entry.attachTo,
        data: entry.data,
        type: entry.room.type,
        height: blockHeight(workspace, entry.room.type),
      });
      ensureRoom(workspace);
    }
  }
  const show = new Set(added);
  for (const top of unfilledOutlines(workspace, entries)) {
    show.add(top);
  }
  showBlocks(workspace, [...show]);
  return added.length;
}

/** The rendered height of a block of the type, measured on a throwaway
    block. Blockly events are disabled around it so the probe does not count
    as an edit. */
function blockHeight(
  workspace: BlocklyCore.WorkspaceSvg,
  type: string
): number {
  let probe: BlocklyCore.BlockSvg | undefined;
  BlocklyCore.Events.disable();
  try {
    probe = workspace.newBlock(type) as BlocklyCore.BlockSvg;
    probe.initSvg();
    probe.render();
    return probe.getHeightWidth().height;
  } catch (e) {
    console.warn(`add_blocks room for ${type} not measured:`, e);
    return STACK_GAP_PX;
  } finally {
    probe?.dispose(false);
    BlocklyCore.Events.enable();
  }
}

// Scroll the blocks on screen: a long program can leave them below the
// fold of a small screen. Only up or down, so the stacks keep their left
// edge.
async function showBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  blocks: BlocklyCore.BlockSvg[]
): Promise<void> {
  if (!blocks.length) {
    return;
  }
  await heightsSettled();
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
    STACK_GAP_PX,
    'vertical'
  );
}
