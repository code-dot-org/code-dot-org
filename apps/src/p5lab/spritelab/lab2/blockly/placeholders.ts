// Sizes a placeholder block (blockDefinitions/placeholder.ts) like the block
// it stands in for: that block is built on the workspace, measured and
// disposed with events off, so nothing paints or saves.

import * as BlocklyCore from 'blockly/core';

import {
  PLACEHOLDER_BLOCK_TYPE,
  PLACEHOLDER_SPACER,
  PLACEHOLDER_SPACER_FIELD,
  PlaceholderBlock,
} from './blockDefinitions/placeholder';

function measureBlock(
  state: BlocklyCore.serialization.blocks.State,
  workspace: BlocklyCore.WorkspaceSvg
): {width: number; height: number} | null {
  BlocklyCore.Events.disable();
  try {
    const probe = BlocklyCore.serialization.blocks.append(state, workspace, {
      recordUndo: false,
    }) as BlocklyCore.BlockSvg;
    probe.initSvg();
    probe.render();
    const size = probe.getHeightWidth();
    probe.dispose(false);
    return size;
  } catch (e) {
    console.warn('placeholder could not measure its block:', e);
    return null;
  } finally {
    BlocklyCore.Events.enable();
  }
}

/** Grow a placeholder's spacer so the block matches its `like`'s size. */
export function sizeLike(block: BlocklyCore.BlockSvg & PlaceholderBlock) {
  if (!block.like || block.disposed || !block.workspace.rendered) {
    return;
  }
  const target = measureBlock(block.like, block.workspace);
  // A bare placeholder's size, less its spacer, is the chrome around it.
  const bare = measureBlock({type: PLACEHOLDER_BLOCK_TYPE}, block.workspace);
  if (!target || !bare) {
    return;
  }
  const spacer = block.getField(PLACEHOLDER_SPACER_FIELD);
  const input = block.inputList[0];
  if (!spacer || !input) {
    return;
  }
  const width = target.width - (bare.width - PLACEHOLDER_SPACER.width);
  const height = target.height - (bare.height - PLACEHOLDER_SPACER.height);
  const src = spacer.getValue() as string;
  input.removeField(PLACEHOLDER_SPACER_FIELD);
  input.appendField(
    new BlocklyCore.FieldImage(
      src,
      Math.max(1, Math.round(width)),
      Math.max(1, Math.round(height)),
      ''
    ),
    PLACEHOLDER_SPACER_FIELD
  );
  block.render();
}
