// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in; and
// placeholders it hangs on stacks that are already there.

import * as BlocklyCore from 'blockly/core';

import {
  PLACEHOLDER_BLOCK_TYPE,
  PlaceholderState,
} from './blockly/blockDefinitions/placeholder';
import {fieldValue, ObjectiveCheck} from './objectives';
import {mapSavedTopBlocks} from './savedBlocks';
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

/** A block that fills an outline: its type, and the field values it has
    to carry when the checklist step asks for some. */
export interface Filler {
  type: string;
  fields?: Record<string, unknown>;
}

/**
 * The blocks that fill an entry's outline. An outline is the hint for a
 * checklist step, so these are the blocks that step accepts, with the field
 * values it asks for. A level that accepts several blocks under one event
 * lists them in its check, and any of them fills the outline.
 *
 * A check is about this entry's stack when it names the stack: by its top
 * block's type (`under`), by its tag (`data`), or both. A check that names
 * neither is about no stack in particular, so it fills no outline.
 *
 * When one of those checks accepts the block the outline is drawn to look
 * like, that check is the outline's own step, and the stack's other steps
 * are left out. Otherwise every check about the stack counts, and so does
 * the block the outline is drawn to look like.
 */
export function fillers(
  entry: AddBlockEntry,
  blockChecks: BlockCheck[]
): Filler[] {
  const placeholder = placeholderOf(entry);
  if (!placeholder) {
    return [];
  }
  const topType = isAttachment(entry) ? entry.attachTo : entry.type;
  const like = (placeholder.extraState as PlaceholderState | undefined)?.like
    ?.type;
  const typesOf = (check: BlockCheck) =>
    Array.isArray(check.type) ? check.type : [check.type];
  const aboutStack = blockChecks.filter(
    check =>
      (check.under !== undefined || check.data !== undefined) &&
      (check.under === undefined || check.under === topType) &&
      (check.data === undefined || check.data === entry.data)
  );
  const ownStep = aboutStack.filter(
    check => !!like && typesOf(check).includes(like)
  );
  const accepted = (ownStep.length ? ownStep : aboutStack).flatMap(check =>
    typesOf(check).map(type => ({type, fields: check.fields}))
  );
  return ownStep.length || !like ? accepted : [{type: like}, ...accepted];
}

/** The block types that fill an entry's outline (see fillers). */
export function fillingTypes(
  entry: AddBlockEntry,
  blockChecks: BlockCheck[]
): string[] {
  return [...new Set(fillers(entry, blockChecks).map(filler => filler.type))];
}

function fills(block: BlocklyCore.Block, filler: string | Filler): boolean {
  const {type, fields} =
    typeof filler === 'string' ? ({type: filler} as Filler) : filler;
  return (
    block.type === type &&
    Object.entries(fields ?? {}).every(
      ([name, wanted]) =>
        fieldValue(block.getFieldValue(name)) === fieldValue(wanted)
    )
  );
}

/** Whether a stack holds a real block (not an outline) that fills the
    outline, anywhere under its top block. A block the student has disabled
    does not count, as in the checklist. */
export function stackHolds(
  top: BlocklyCore.Block,
  fillers: readonly (string | Filler)[]
): boolean {
  return top
    .getDescendants(false)
    .some(
      block =>
        block !== top &&
        !block.isShadow() &&
        block.isEnabled() &&
        fillers.some(filler => fills(block, filler))
    );
}

/** The event group of the changes the lab makes to the outlines. An
    outline is not saved, so such a change is not an edit to save or run. */
export const OUTLINE_EVENT_GROUP = 'outlines';

// A change the lab makes to the outlines is not the student's to undo, and
// is marked with the outlines' event group.
function asOutlineChange(change: () => void): void {
  const recording = BlocklyCore.Events.getRecordUndo();
  const group = BlocklyCore.Events.getGroup();
  BlocklyCore.Events.setRecordUndo(false);
  BlocklyCore.Events.setGroup(OUTLINE_EVENT_GROUP);
  try {
    change();
  } finally {
    BlocklyCore.Events.setGroup(group);
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

/** Removes the outline from the end of a stack, if it is showing there. */
function removeOutline(top: BlocklyCore.Block, shadow: Shadow): void {
  const end = trailingShadow(top);
  if (end && samePlaceholder(end.connection.getShadowState(), shadow)) {
    end.connection.setShadowState(null);
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
  fillers: readonly (string | Filler)[]
): boolean {
  if (stackHolds(top, fillers)) {
    removeOutline(top, shadow);
    return false;
  }
  const end = trailingShadow(top);
  const showing =
    !!end && samePlaceholder(end.connection.getShadowState(), shadow);
  if (end && showing) {
    // A project saved before outlines were left out of the save can hold
    // the outline as an earlier version of the level drew it. When the
    // level's version has changed (blank or not), it is drawn again.
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

function stripOutlines(block: AddBlock): AddBlock {
  const out: AddBlock = {...block};
  if (block.inputs) {
    out.inputs = Object.fromEntries(
      Object.entries(block.inputs).map(([name, input]) => [
        name,
        input.block ? {...input, block: stripOutlines(input.block)} : input,
      ])
    );
  }
  if (block.next) {
    const {shadow, block: below} = block.next;
    const outline = shadow?.type === PLACEHOLDER_BLOCK_TYPE;
    if (below) {
      out.next = {
        ...(shadow && !outline && {shadow}),
        block: stripOutlines(below),
      };
    } else if (outline) {
      delete out.next;
    }
  }
  return out;
}

/**
 * The serialized workspace with every outline left out, for saving. An
 * outline is the level's hint, not the student's work: the level draws it
 * when it opens (see syncOutlines), so the saved project never holds one.
 */
export function withoutOutlines<
  T extends {blocks?: {languageVersion?: number; blocks?: AddBlock[]}}
>(serialized: T): T {
  return mapSavedTopBlocks(serialized, stripOutlines);
}

/**
 * Removes every outline showing at the end of a stack that none of the
 * level's entries puts there. A project saved before outlines were left
 * out of the save (see withoutOutlines) can hold an earlier level's
 * outline that was never filled, which would otherwise show as this
 * level's hint. Returns how many were removed.
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
 * this level's outlines is shown or removed by whether a stack it belongs
 * on holds the block it asks for. It is safe to run at any time and as
 * often as needed; a second run changes nothing. Returns the stacks whose
 * outline is showing.
 *
 * `opening` is the pass made as the level opens. An outline that nothing
 * says how to fill (no block it is drawn to look like, and no check that
 * names its stack) is drawn on that pass only. On a later pass it would be
 * drawn again under every block the student dropped on it.
 */
export function syncOutlines(
  workspace: BlocklyCore.Workspace,
  entries: AddBlockEntry[],
  blockChecks: BlockCheck[],
  opening = false
): BlocklyCore.Block[] {
  const showing = new Set<BlocklyCore.Block>();
  asOutlineChange(() => {
    forgetCoveredOutlines(workspace);
    dropStalePlaceholders(workspace, entries);
    for (const entry of entries) {
      const placeholder = placeholderOf(entry);
      if (!placeholder) {
        continue;
      }
      const filledBy = fillers(entry, blockChecks);
      if (!filledBy.length && !opening) {
        continue;
      }
      const stacks = workspace
        .getTopBlocks(false)
        .filter(top => entryOn(entry, top));
      // A student can have several stacks of one event. The checklist step
      // is done once any of them holds the block, so then none of them
      // shows the outline. Otherwise filling one stack would move the
      // outline to the next.
      const done = stacks.some(top => stackHolds(top, filledBy));
      // The outline is drawn on one stack only: the first that can take
      // it. It is removed from every other stack.
      let shown = false;
      for (const top of stacks) {
        try {
          if (!done && !shown && syncStackOutline(top, placeholder, filledBy)) {
            showing.add(top);
            shown = true;
          } else {
            removeOutline(top, placeholder);
          }
        } catch (e) {
          // An outline the pool cannot build (a misnamed type or field) is
          // a level-authoring slip. The level's other outlines are still
          // drawn.
          console.warn('add_blocks outline not drawn:', e);
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
 * blocks, which say what fills each outline. `stillWanted` is asked after
 * the wait for the workspace to settle, and a pass that is no longer
 * wanted does nothing. Returns how many blocks were added. Fires ordinary create events, so the workspace saves and re-runs
 * as after an edit. Then scrolls what was added, and any outline of the
 * level's still waiting for its block, into view, so a pass with nothing
 * to add still shows the student their task.
 */
export async function addMissingBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  entries: AddBlockEntry[],
  blockChecks: BlockCheck[] = [],
  stillWanted: () => boolean = () => true
): Promise<number> {
  await heightsSettled();
  // The wait can outlast the scene these entries were for.
  if (!workspace.rendered || !stillWanted()) {
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
    if (syncOutlines(workspace, entries, blockChecks, true).length) {
      ensureRoom(workspace);
    }
  } catch (e) {
    // The level must still open when its outlines cannot be drawn.
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
