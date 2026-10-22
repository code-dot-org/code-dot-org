// A ghost stack: the blocks a level wants built, drawn as dashed outlines
// in the workspace. The student builds the real thing from the toolbox;
// once the stack's top block is in the workspace the ghost goes, leaving
// a placeholder on the real block for each block the ghost held inside
// or under it. A ghost runs nothing, connects to nothing, and is never
// saved.

import * as BlocklyCore from 'blockly/core';

import {
  PLACEHOLDER_BLOCK_TYPE,
  PLACEHOLDER_CLASS,
} from './blockly/blockDefinitions/placeholder';

type BlockState = BlocklyCore.serialization.blocks.State;

/** A level's ghost: the stack to build, and the tag that names it. */
export interface GhostStack {
  ghost: BlockState;
  /** Carried by every block of the ghost in the workspace. */
  data: string;
}

export function isGhostStack(entry: unknown): entry is GhostStack {
  return typeof entry === 'object' && entry !== null && 'ghost' in entry;
}

const GHOST_PREFIX = 'ghost:';
const GHOST_CLASS = 'blocklyGhost';
const DISABLED_REASON = 'ghost';

export function ghostTag(data: string): string {
  return GHOST_PREFIX + data;
}

export function isGhostBlock(
  block: BlocklyCore.Block | null | undefined
): boolean {
  return !!block?.data?.startsWith(GHOST_PREFIX);
}

/** The state with the ghost's tag on every block, so the workspace can
    tell the ghost's blocks from the student's. */
export function tagged(state: BlockState, tag: string): BlockState {
  const out: BlockState = {...state, data: tag};
  if (state.inputs) {
    out.inputs = Object.fromEntries(
      Object.entries(state.inputs).map(([name, input]) => [
        name,
        {
          ...(input.block && {block: tagged(input.block, tag)}),
          ...(input.shadow && {shadow: tagged(input.shadow, tag)}),
        },
      ])
    );
  }
  if (state.next) {
    out.next = {
      ...(state.next.block && {block: tagged(state.next.block, tag)}),
      ...(state.next.shadow && {shadow: tagged(state.next.shadow, tag)}),
    };
  }
  return out;
}

/** A block of `type` the student built: real, not a ghost, not a shadow. */
export function hasRealTop(
  workspace: BlocklyCore.Workspace,
  type: string
): BlocklyCore.Block | null {
  return (
    workspace
      .getTopBlocks(false)
      .find(top => top.type === type && !isGhostBlock(top)) ?? null
  );
}

function ghostBlocks(
  workspace: BlocklyCore.Workspace,
  tag: string
): BlocklyCore.Block[] {
  return workspace.getTopBlocks(false).filter(top => top.data === tag);
}

function dress(block: BlocklyCore.Block): void {
  block.setDisabledReason(true, DISABLED_REASON);
  block.setDeletable(false);
  block.setMovable(false);
  block.setEditable(false);
  if (block instanceof BlocklyCore.BlockSvg && block.rendered) {
    const root = block.getSvgRoot();
    root.classList.add(PLACEHOLDER_CLASS, GHOST_CLASS);
  }
}

/** Put the ghost in the workspace at (x, y), unless it is there already
    or the student has built its top block. Returns the ghost's top. */
export function placeGhost(
  workspace: BlocklyCore.WorkspaceSvg,
  entry: GhostStack,
  at: {x: number; y: number}
): BlocklyCore.BlockSvg | null {
  const tag = ghostTag(entry.data);
  if (
    hasRealTop(workspace, entry.ghost.type) ||
    ghostBlocks(workspace, tag).length
  ) {
    return null;
  }
  BlocklyCore.Events.disable();
  try {
    const top = BlocklyCore.serialization.blocks.append(
      {...tagged(entry.ghost, tag), ...at},
      workspace,
      {recordUndo: false}
    ) as BlocklyCore.BlockSvg;
    top.getDescendants(false).forEach(dress);
    return top;
  } finally {
    BlocklyCore.Events.enable();
  }
}

/** The placeholder standing for a ghost's block. */
function placeholderLike(state: BlockState): BlockState {
  const like = {...state};
  delete like.data;
  return {type: PLACEHOLDER_BLOCK_TYPE, extraState: {like}};
}

// The real block takes a placeholder wherever the ghost held a block: on
// the same inputs, and under it. A slot the student already filled is
// left alone.
function hangPlaceholders(real: BlocklyCore.Block, ghost: BlockState): void {
  for (const [name, input] of Object.entries(ghost.inputs ?? {})) {
    const connection = real.getInput(name)?.connection;
    if (input.block && connection && !connection.targetBlock()) {
      connection.setShadowState(placeholderLike(input.block));
    }
  }
  if (ghost.next?.block && real.nextConnection && !real.getNextBlock()) {
    real.nextConnection.setShadowState(placeholderLike(ghost.next.block));
  }
}

/**
 * Once the student has the ghost's top block in the workspace, the ghost
 * goes and the real block gets the placeholders. True when that happened.
 */
export function settleGhost(
  workspace: BlocklyCore.WorkspaceSvg,
  entry: GhostStack
): boolean {
  const real = hasRealTop(workspace, entry.ghost.type);
  if (!real) {
    return false;
  }
  const ghosts = ghostBlocks(workspace, ghostTag(entry.data));
  if (!ghosts.length) {
    return false;
  }
  BlocklyCore.Events.disable();
  try {
    ghosts.forEach(ghost => ghost.dispose(false));
    hangPlaceholders(real, entry.ghost);
  } finally {
    BlocklyCore.Events.enable();
  }
  return true;
}

/** Keep a ghost from taking or joining any connection. */
export function guardGhostConnections(
  workspace: BlocklyCore.WorkspaceSvg
): void {
  const checker = workspace.connectionChecker;
  const canConnect = checker.canConnect.bind(checker);
  checker.canConnect = (a, b, isDragging, distance) =>
    !isGhostBlock(a?.getSourceBlock()) &&
    !isGhostBlock(b?.getSourceBlock()) &&
    canConnect(a, b, isDragging, distance);
}

/** The serialized workspace without the ghosts. */
export function withoutGhosts<
  T extends {blocks?: {languageVersion?: number; blocks?: BlockState[]}}
>(serialized: T): T {
  const blocks = serialized.blocks?.blocks;
  if (!blocks?.some(block => block.data?.startsWith(GHOST_PREFIX))) {
    return serialized;
  }
  return {
    ...serialized,
    blocks: {
      ...serialized.blocks,
      blocks: blocks.filter(block => !block.data?.startsWith(GHOST_PREFIX)),
    },
  };
}
