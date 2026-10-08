// How a placeholder block (blockDefinitions/placeholder.ts) is drawn: its
// dashed outline, and its size, matched to the block it stands in for by
// building that block, measuring it and disposing it with events off, so
// nothing paints or saves.

import * as BlocklyCore from 'blockly/core';

import {
  PLACEHOLDER_BLOCK_TYPE,
  PLACEHOLDER_CLASS,
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
function sizeLike(block: BlocklyCore.BlockSvg & PlaceholderBlock) {
  if (!block.like || block.disposed || !block.workspace.rendered) {
    return;
  }
  const target = measureBlock(block.like, block.workspace);
  // A bare placeholder's size, less its spacer, is the border and padding
  // around the spacer.
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

let placeholderCount = 0;

// Blockly draws a shadow with no stroke; the class restores one, dashed
// (cdoCss.ts), clipped to the path's inside so it never crosses the block
// above. Sizing builds probe blocks, so it waits for a microtask: never
// inside the deserialization that is building this one.
export function placeholderOutline(this: BlocklyCore.Block) {
  // Headless blocks (code generation, tests) have no SVG to draw.
  if (!(this instanceof BlocklyCore.BlockSvg)) {
    return;
  }
  const initSvg = this.initSvg.bind(this);
  const dispose = this.dispose.bind(this);
  let clip: SVGClipPathElement | null = null;
  this.initSvg = () => {
    initSvg();
    this.getSvgRoot().classList.add(PLACEHOLDER_CLASS);
    const defs = this.workspace.getParentSvg().querySelector('defs');
    if (clip || !defs) {
      return;
    }
    const id = `spritelab2-placeholder-${placeholderCount++}`;
    const path = this.pathObject.svgPath;
    path.setAttribute('id', `${id}-path`);
    clip = BlocklyCore.utils.dom.createSvgElement(
      BlocklyCore.utils.Svg.CLIPPATH,
      {id},
      defs
    );
    BlocklyCore.utils.dom.createSvgElement('use', {href: `#${id}-path`}, clip);
    path.setAttribute('clip-path', `url(#${id})`);
    queueMicrotask(() =>
      sizeLike(this as BlocklyCore.BlockSvg & PlaceholderBlock)
    );
  };
  this.dispose = (...args) => {
    clip?.remove();
    clip = null;
    dispose(...args);
  };
}
