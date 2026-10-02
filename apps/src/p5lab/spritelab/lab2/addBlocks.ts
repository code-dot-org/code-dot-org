// Blocks a level adds to the pinned scene's workspace when the student
// arrives, so an event the level teaches is already there to fill in; and
// placeholders it hangs on stacks that are already there.

import * as BlocklyCore from 'blockly/core';

/** A block to add. Its `data`, when set, tells it apart from another entry
    of the same type in one scene. */
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

/** A block in the workspace, read live: serialized field values are not
    the level JSON's (a dropdown saves as XML, custom fields not at all). */
export interface PresentBlock {
  type: string;
  data?: string | null;
  fieldValue(name: string): unknown;
  inputFieldValue(input: string, name: string): unknown;
}

export function presentBlock(block: BlocklyCore.Block): PresentBlock {
  return {
    type: block.type,
    data: block.data,
    fieldValue: name => block.getFieldValue(name),
    inputFieldValue: (input, name) =>
      block.getInputTargetBlock(input)?.getFieldValue(name),
  };
}

// The values an entry pins down: its own fields, and the fields of the
// shadows (or blocks) in its inputs.
function pinnedValues(entry: AddBlock): [string | null, string, unknown][] {
  const values: [string | null, string, unknown][] = Object.entries(
    entry.fields ?? {}
  ).map(([name, value]) => [null, name, value]);
  for (const [input, {shadow, block}] of Object.entries(entry.inputs ?? {})) {
    const fields: Record<string, unknown> | undefined = (block ?? shadow)
      ?.fields;
    for (const [name, value] of Object.entries(fields ?? {})) {
      values.push([input, name, value]);
    }
  }
  return values;
}

// Field values compare as text; a field that holds an object (a variable's
// id and name) compares by its JSON.
function sameValue(have: unknown, want: unknown): boolean {
  if (have === undefined || have === null) {
    return false;
  }
  const text = (v: unknown) =>
    typeof v === 'object' ? JSON.stringify(v) : String(v);
  return text(have) === text(want);
}

/** Whether a workspace block stands for an entry: it carries the entry's
    tag, or, untagged (older than tags, or built from the toolbox), it has
    the entry's type and every value the entry pins. */
export function matchesEntry(
  present: PresentBlock,
  entry: AddBlock,
  pins = pinnedValues(entry)
): boolean {
  if (present.type !== entry.type) {
    return false;
  }
  if (entry.data && present.data) {
    return present.data === entry.data;
  }
  return pins.every(([input, name, value]) =>
    sameValue(
      input ? present.inputFieldValue(input, name) : present.fieldValue(name),
      value
    )
  );
}

/** The blocks the workspace lacks (see matchesEntry). */
export function missingBlocks(
  present: Iterable<PresentBlock>,
  blocks: AddBlock[]
): AddBlock[] {
  const presentBlocks = Array.from(present);
  return blocks.filter(block => {
    const pins = pinnedValues(block);
    return !presentBlocks.some(p => matchesEntry(p, block, pins));
  });
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
 * the workspace saves and re-runs as after an edit.
 */
export function addMissingBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  entries: AddBlockEntry[]
): number {
  const blocks = entries.filter(
    (entry): entry is AddBlock => !isAttachShadow(entry)
  );
  const present = workspace
    .getAllBlocks(false)
    .filter(block => !block.isShadow())
    .map(presentBlock);
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
  showBlocks(workspace, added);
  return added.length;
}

// Scroll the blocks just added on screen: a long program can leave them
// below the fold of a small screen.
async function showBlocks(
  workspace: BlocklyCore.WorkspaceSvg,
  blocks: BlocklyCore.BlockSvg[]
): Promise<void> {
  // scrollBoundsIntoView is internal to Blockly: without it, no scroll.
  if (
    !blocks.length ||
    !workspace.isMovable() ||
    typeof workspace.scrollBoundsIntoView !== 'function'
  ) {
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
  workspace.scrollBoundsIntoView(
    new BlocklyCore.utils.Rect(
      Math.min(...rects.map(r => r.top)),
      Math.max(...rects.map(r => r.bottom)),
      Math.min(...rects.map(r => r.left)),
      Math.max(...rects.map(r => r.right))
    ),
    STACK_GAP_PX
  );
}
