// What the placeholder block and its rendering (placeholderRendering.ts,
// placeholderPreviewer.ts) share, apart so neither imports the other.

import type * as BlocklyCore from 'blockly/core';

export const PLACEHOLDER_BLOCK_TYPE = 'spritelab2_placeholder';

/** Blockly extension and mutator names: the dashed outline, and the
    `like` state that sizes the block like the one it stands in for. */
export const PLACEHOLDER_OUTLINE_EXTENSION = 'spritelab2_placeholder_outline';
export const PLACEHOLDER_MUTATOR = 'spritelab2_placeholder_like';

/** The svg classes the outline's CSS selects (cdoCss.ts): the block, and
    the block while a dragged block hovers over its connection. */
export const PLACEHOLDER_CLASS = 'blocklyPlaceholder';
export const PLACEHOLDER_ACTIVE_CLASS = 'blocklyPlaceholderActive';

// The block is an empty box: one transparent image gives it a size, later
// matched to the block it stands in for (placeholders.ts).
export const PLACEHOLDER_SPACER_FIELD = 'SPACE';
export const PLACEHOLDER_SPACER = {width: 160, height: 24};
export const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** A placeholder's extra state: the block it should be the size of. */
export interface PlaceholderState {
  like?: BlocklyCore.serialization.blocks.State;
}

export interface PlaceholderBlock extends BlocklyCore.Block {
  like?: BlocklyCore.serialization.blocks.State;
}
