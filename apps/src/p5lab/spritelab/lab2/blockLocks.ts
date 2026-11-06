// On a level that opts in (lock_earlier_blocks), blocks a student built on
// an earlier level cannot be deleted: a stack deleted by accident would
// leave the student with no way to continue. They can still be moved. The
// locks belong to the level, are set as the pinned scene loads and are
// never saved, so a later level without the property loads the same
// project with every block deletable again.

import * as BlocklyCore from 'blockly/core';

import {requiredBlockTypes} from './blockCatalog';
import {WHEN_RUN_BLOCK_TYPE} from './blockly/blockDefinitions/whenRun';
import {SpriteLab2LevelProperties} from './types';

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

/** The toolbox block types a student may delete on a locked level: the
    student may have dragged one out here and reloaded. A type an earlier
    level had them build on is left out, as its block is as likely the one
    built there. */
export function ownToolboxTypes(
  toolbox: BlocklyCore.utils.toolbox.ToolboxInfo | undefined,
  earlier: readonly SpriteLab2LevelProperties[]
): Set<string> {
  const required = new Set(earlier.flatMap(requiredBlockTypes));
  return new Set(
    [...toolboxBlockTypes(toolbox)].filter(type => !required.has(type))
  );
}

/** Make every real block in the workspace undeletable, except the blocks
    `isOwn` claims as the level's own; a stack built here stays as deletable
    as its blocks. */
export function lockBlocks(
  workspace: BlocklyCore.Workspace,
  isOwn: (block: BlocklyCore.Block) => boolean = () => false
): void {
  workspace.getTopBlocks(false).forEach(top => {
    top.getDescendants(false).forEach(block => {
      if (!block.isShadow() && !isOwn(block)) {
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
