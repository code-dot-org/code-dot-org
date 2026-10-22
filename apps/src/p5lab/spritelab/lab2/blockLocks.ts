// Blocks a student built on an earlier level cannot be deleted on later
// ones: a stack deleted by accident would strand the student. They can
// still be moved. The locks are the level's, set as the scene loads and
// never saved, so free play loads the same project with every block free
// again.

import * as BlocklyCore from 'blockly/core';

import {WHEN_RUN_BLOCK_TYPE} from './blockly/blockDefinitions/whenRun';

type BlockState = BlocklyCore.serialization.blocks.State;

/** Keep every real block in the workspace from deletion, but for the
    stacks `own` claims: the level's own, built on it and still free. */
export function lockBlocks(
  workspace: BlocklyCore.Workspace,
  own: (top: BlocklyCore.Block) => boolean = () => false
): void {
  workspace.getTopBlocks(false).forEach(top => {
    if (own(top)) {
      return;
    }
    top.getDescendants(false).forEach(block => {
      if (!block.isShadow()) {
        block.setDeletable(false);
      }
    });
  });
}

function stripLocks(block: BlockState): BlockState {
  const {deletable, movable, ...rest} = block;
  // When-run is pinned by the project's own sources, not by a level.
  const kept = block.type === WHEN_RUN_BLOCK_TYPE ? {deletable, movable} : {};
  const out: BlockState = {...rest, ...kept};
  if (block.inputs) {
    out.inputs = Object.fromEntries(
      Object.entries(block.inputs).map(([name, input]) => [
        name,
        {
          ...(input.block && {block: stripLocks(input.block)}),
          ...(input.shadow && {shadow: input.shadow}),
        },
      ])
    );
  }
  if (block.next?.block) {
    out.next = {...block.next, block: stripLocks(block.next.block)};
  }
  return out;
}

/** The serialized workspace with the level's locks left out. */
export function withoutLocks<
  T extends {blocks?: {languageVersion?: number; blocks?: BlockState[]}}
>(serialized: T): T {
  const blocks = serialized.blocks?.blocks;
  if (!blocks) {
    return serialized;
  }
  return {
    ...serialized,
    blocks: {...serialized.blocks, blocks: blocks.map(stripLocks)},
  };
}
