// Blocks a student built on an earlier level cannot be deleted on later
// levels: a stack deleted by accident would leave the student with no way to
// continue. They can still be moved. The locks belong to the level, are set
// as the scene loads and are never saved, so free play loads the same
// project with every block deletable again.

import * as BlocklyCore from 'blockly/core';

import {WHEN_RUN_BLOCK_TYPE} from './blockly/blockDefinitions/whenRun';

type BlockState = BlocklyCore.serialization.blocks.State;

/** Every block type a toolbox offers, through its categories. */
export function toolboxBlockTypes(
  toolbox: BlocklyCore.utils.toolbox.ToolboxInfo | undefined
): Set<string> {
  const types = new Set<string>();
  const walk = (items: BlocklyCore.utils.toolbox.ToolboxItemInfo[]) =>
    items.forEach(item => {
      const entry = item as {type?: string; contents?: unknown};
      if (entry.type) {
        types.add(entry.type);
      }
      if (Array.isArray(entry.contents)) {
        walk(entry.contents as BlocklyCore.utils.toolbox.ToolboxItemInfo[]);
      }
    });
  walk(
    (toolbox?.contents ?? []) as BlocklyCore.utils.toolbox.ToolboxItemInfo[]
  );
  return types;
}

/** Make every real block in the workspace undeletable, except the stacks
    `isOwnStack` claims as the level's own. */
export function lockBlocks(
  workspace: BlocklyCore.Workspace,
  isOwnStack: (top: BlocklyCore.Block) => boolean = () => false
): void {
  workspace.getTopBlocks(false).forEach(top => {
    if (isOwnStack(top)) {
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
  // The when-run block's flags come from the project's own sources, not
  // from a level lock, so they are kept.
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
