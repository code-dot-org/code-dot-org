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

// Below the existing stacks, with room for three more blocks under them
// before the added block begins: the blocks later levels have the student
// add under when-run.
const ROOM_BELOW_PX = 144;

/** The blocks the workspace lacks. A block without data (added before
    entries carried any) stands for every entry of its type. */
export function missingBlocks(
  present: Iterable<{type: string; data?: string | null}>,
  blocks: AddBlock[]
): AddBlock[] {
  const presentBlocks = Array.from(present);
  return blocks.filter(
    block =>
      !presentBlocks.some(
        p =>
          p.type === block.type &&
          (!block.data || !p.data || p.data === block.data)
      )
  );
}

/** Where the next added block begins: under the lowest stack's bottom
    edge, at the leftmost stack's x. An empty workspace starts at the
    origin. */
export function placeBelow(stacks: {x: number; y: number; height: number}[]): {
  x: number;
  y: number;
} {
  if (stacks.length === 0) {
    return {x: 0, y: 0};
  }
  return {
    x: Math.min(...stacks.map(s => s.x)),
    y: Math.max(...stacks.map(s => s.y + s.height)) + ROOM_BELOW_PX,
  };
}

type Shadow = BlocklyCore.serialization.blocks.State;

// Placeholders are told apart by the block they stand in for.
function likeType(shadow: Shadow | null | undefined): string | undefined {
  const like = (shadow?.extraState as {like?: {type?: string}} | undefined)
    ?.like;
  return like?.type;
}

function samePlaceholder(a: Shadow | null | undefined, b: Shadow): boolean {
  return !!a && a.type === b.type && likeType(a) === likeType(b);
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

/** Hang the shadow on the first stack of the type with a free end;
    returns whether it was hung. */
export function attachShadow(
  workspace: BlocklyCore.Workspace,
  entry: AttachShadow
): boolean {
  for (const top of workspace.getTopBlocks(false)) {
    if (top.type !== entry.attachTo) {
      continue;
    }
    const connection = freeStackEnd(top, entry.shadow);
    if (connection) {
      connection.setShadowState(entry.shadow);
      return true;
    }
  }
  return false;
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
  const missing = missingBlocks(workspace.getAllBlocks(false), blocks);
  let added = 0;
  for (const entry of missing) {
    const stacks = workspace.getTopBlocks(false).map(top => {
      const {x, y} = top.getRelativeToSurfaceXY();
      return {x, y, height: top.getHeightWidth().height};
    });
    const {x, y} = placeBelow(stacks);
    try {
      BlocklyCore.serialization.blocks.append({...entry, x, y}, workspace, {
        recordUndo: false,
      });
      added++;
    } catch (e) {
      // A block the pool cannot build (a misnamed input, a missing type) is
      // a level-authoring slip; the level must still open.
      console.warn(`add_blocks entry ${entry.type} not added:`, e);
    }
  }
  for (const entry of entries) {
    if (isAttachShadow(entry)) {
      try {
        if (attachShadow(workspace, entry)) {
          added++;
        }
      } catch (e) {
        console.warn(`add_blocks shadow for ${entry.attachTo} not hung:`, e);
      }
    }
  }
  return added;
}
