// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in; and
// placeholders it hangs on stacks that are already there.

import * as BlocklyCore from 'blockly/core';

import {PLACEHOLDER_BLOCK_TYPE} from './blockly/blockDefinitions/placeholder';
import {ObjectiveCheck} from './objectives';
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
  /** The tag the top block must carry, when one stack of the type is
      meant: the `data` of the level's own entry for it. */
  data?: string;
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

/** Whether a stack is the one an attachment hangs on: its top block's type,
    and its tag when the entry names one. */
export function attachesTo(
  entry: AttachShadow | AttachRoom,
  top: PresentBlock
): boolean {
  return (
    top.type === entry.attachTo && (!entry.data || top.data === entry.data)
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

/** A checklist step's check for a block, as the level writes it. */
export type BlockCheck = Extract<ObjectiveCheck, {kind: 'block'}>;

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

/** The placeholder an entry carries: hung on a stack, or under the block
    the entry adds. A room has none. */
function placeholderOf(entry: AddBlockEntry): Shadow | undefined {
  return isAttachShadow(entry)
    ? entry.shadow
    : isAttachRoom(entry)
    ? undefined
    : entry.next?.shadow;
}

/** Whether an entry's placeholder belongs on the stack with this top. */
function entryOn(entry: AddBlockEntry, top: PresentBlock): boolean {
  return isAttachment(entry)
    ? attachesTo(entry, top)
    : matchesEntry(top, entry);
}

/**
 * The block types that fill an entry's outline. An outline is the hint for
 * a checklist step, so these are the types that step accepts: the block
 * checks the level makes under the same top block (and the same tag, when
 * the check names one), plus the block the outline is drawn to look like.
 * A level that accepts several blocks under one event lists them in its
 * check, and any of them fills the outline.
 */
export function fillingTypes(
  entry: AddBlockEntry,
  blockChecks: BlockCheck[]
): string[] {
  const placeholder = placeholderOf(entry);
  if (!placeholder) {
    return [];
  }
  const topType = isAttachment(entry) ? entry.attachTo : entry.type;
  const like = (placeholder.extraState as {like?: {type?: string}} | undefined)
    ?.like?.type;
  const accepted = blockChecks
    .filter(
      check =>
        check.under === topType &&
        (check.data === undefined || check.data === entry.data)
    )
    .flatMap(check => check.type);
  return [...new Set([...(like ? [like] : []), ...accepted])];
}

/** Whether a stack holds a real block (not an outline) of one of the
    types, anywhere under its top block. */
export function stackHolds(top: BlocklyCore.Block, types: string[]): boolean {
  return top
    .getDescendants(false)
    .some(
      block => block !== top && !block.isShadow() && types.includes(block.type)
    );
}

// A change the lab makes to the outlines is not the student's to undo.
function withoutUndo(change: () => void): void {
  const recording = BlocklyCore.Events.getRecordUndo();
  BlocklyCore.Events.setRecordUndo(false);
  try {
    change();
  } finally {
    BlocklyCore.Events.setRecordUndo(recording);
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

/** The connection under a stack's last block, or null when that block has
    none or already holds a shadow there. */
function freeEnd(top: BlocklyCore.Block): BlocklyCore.Connection | null {
  for (let block: BlocklyCore.Block = top; ; ) {
    const connection = block.nextConnection;
    if (!connection) {
      return null;
    }
    const next = connection.targetBlock();
    if (!next) {
      return connection;
    }
    if (next.isShadow()) {
      return null;
    }
    block = next;
  }
}

/**
 * Makes one stack show its outline, or not, by what the stack holds. The
 * outline is shown at the end of the stack while the stack has no block of
 * the filling types, and removed once it has one. Nothing is remembered
 * about the outline when it is not showing: the stack's own blocks say
 * whether the step it hints at is done. Returns whether the outline is
 * showing afterwards.
 */
export function syncStackOutline(
  top: BlocklyCore.Block,
  shadow: Shadow,
  types: string[]
): boolean {
  const end = trailingShadow(top);
  const showing =
    !!end && samePlaceholder(end.connection.getShadowState(), shadow);
  if (stackHolds(top, types)) {
    if (end && showing) {
      end.connection.setShadowState(null);
    }
    return false;
  }
  if (end && showing) {
    // A saved project keeps the outline as it was drawn. When the level's
    // version of it has changed (blank or not), it is drawn again.
    if (isBlank(end.connection.getShadowState()) !== isBlank(shadow)) {
      end.connection.setShadowState(shadow);
    }
    return true;
  }
  const connection = freeEnd(top);
  if (!connection) {
    return false;
  }
  connection.setShadowState(shadow);
  return true;
}

/**
 * Forgets every outline that a real block now covers. When a block is
 * dropped on an outline, Blockly keeps the outline on the connection, out
 * of sight, and would show it again if the block were pulled off, on any
 * level and for the rest of the project's life. The outlines are decided
 * from the stack's blocks instead (see syncStackOutline), so nothing
 * hidden is kept. Returns how many were forgotten.
 */
export function forgetCoveredOutlines(
  workspace: BlocklyCore.Workspace
): number {
  let forgotten = 0;
  for (const block of workspace.getAllBlocks(false)) {
    const connection = block.nextConnection;
    const next = connection?.targetBlock();
    if (
      connection &&
      next &&
      !next.isShadow() &&
      connection.getShadowState()?.type === PLACEHOLDER_BLOCK_TYPE
    ) {
      connection.setShadowState(null);
      forgotten++;
    }
  }
  return forgotten;
}

/**
 * Removes every outline showing at the end of a stack that none of the
 * level's entries puts there. Blockly saves an outline with the block it
 * hangs from, so an earlier level's outline that was never filled would
 * otherwise show as this level's hint. Returns how many were removed.
 */
export function dropStalePlaceholders(
  workspace: BlocklyCore.Workspace,
  entries: AddBlockEntry[]
): number {
  let dropped = 0;
  for (const top of workspace.getTopBlocks(false)) {
    const end = trailingShadow(top);
    const recorded = end?.connection.getShadowState();
    if (!end || recorded?.type !== PLACEHOLDER_BLOCK_TYPE) {
      continue;
    }
    const wanted = entries.some(entry => {
      const placeholder = placeholderOf(entry);
      return (
        !!placeholder &&
        entryOn(entry, top) &&
        samePlaceholder(recorded, placeholder)
      );
    });
    if (!wanted) {
      end.connection.setShadowState(null);
      dropped++;
    }
  }
  return dropped;
}

/**
 * Brings every outline in the workspace in line with the level: hidden
 * outlines are forgotten, other levels' outlines are removed, and each of
 * this level's outlines is shown or removed by whether its stack holds the
 * block it asks for. It is safe to run at any time and as often as needed;
 * a second run changes nothing. Returns the stacks whose outline is
 * showing.
 */
export function syncOutlines(
  workspace: BlocklyCore.Workspace,
  entries: AddBlockEntry[],
  blockChecks: BlockCheck[]
): BlocklyCore.Block[] {
  const showing = new Set<BlocklyCore.Block>();
  withoutUndo(() => {
    forgetCoveredOutlines(workspace);
    dropStalePlaceholders(workspace, entries);
    for (const entry of entries) {
      const placeholder = placeholderOf(entry);
      if (!placeholder) {
        continue;
      }
      const types = fillingTypes(entry, blockChecks);
      for (const top of workspace.getTopBlocks(false)) {
        if (entryOn(entry, top) && syncStackOutline(top, placeholder, types)) {
          showing.add(top);
          // One stack per entry: the first of the type, as before.
          break;
        }
      }
    }
  });
  return [...showing];
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
    const placeholder = placeholderOf(entry);
    if (!placeholder) {
      continue;
    }
    for (const top of tops) {
      const end = trailingShadow(top);
      if (
        end &&
        entryOn(entry, top) &&
        samePlaceholder(end.connection.getShadowState(), placeholder)
      ) {
        found.add(top);
      }
    }
  }
  return [...found];
}

/**
 * Add the level's blocks the workspace lacks, each placed below
 * everything already there, and bring the outlines in line with the level
 * (see syncOutlines). `blockChecks` are the level's checklist checks for
 * blocks, which say what fills each outline. Returns how many blocks were
 * added. Fires ordinary create events, so the workspace saves and re-runs
 * as after an edit. Then scrolls what was added, and any outline of the
 * level's still waiting for its block, into view, so a pass with nothing
 * to add still shows the student their task.
 */
export async function addMissingBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  entries: AddBlockEntry[],
  blockChecks: BlockCheck[] = []
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
  try {
    if (syncOutlines(workspace, entries, blockChecks).length) {
      ensureRoom(workspace);
    }
  } catch (e) {
    // An outline the pool cannot build is a level-authoring slip; the level
    // must still open.
    console.warn('add_blocks outlines not drawn:', e);
  }
  for (const entry of entries) {
    if (isAttachRoom(entry)) {
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
