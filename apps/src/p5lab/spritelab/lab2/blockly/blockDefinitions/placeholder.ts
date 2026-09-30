import * as BlocklyCore from 'blockly/core';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

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
const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

/** A placeholder's extra state: the block it should be the size of. */
export interface PlaceholderState {
  like?: BlocklyCore.serialization.blocks.State;
}

export interface PlaceholderBlock extends BlocklyCore.Block {
  like?: BlocklyCore.serialization.blocks.State;
}

/** Keeps the `like` block through save and load. */
export const placeholderMutator = {
  saveExtraState(this: PlaceholderBlock): PlaceholderState | null {
    return this.like ? {like: this.like} : null;
  },
  loadExtraState(this: PlaceholderBlock, state: PlaceholderState) {
    this.like = state.like;
  },
};

// A slot a level marks for the student to fill, used as the shadow on a
// connection: it draws where a block should go, is replaced by the block
// dropped there, and runs nothing.
const definition: BlockJson = {
  type: PLACEHOLDER_BLOCK_TYPE,
  message0: '%1',
  args0: [
    {
      type: 'field_image',
      name: PLACEHOLDER_SPACER_FIELD,
      src: TRANSPARENT_PIXEL,
      width: PLACEHOLDER_SPACER.width,
      height: PLACEHOLDER_SPACER.height,
      alt: '',
    },
  ],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  extensions: [PLACEHOLDER_OUTLINE_EXTENSION],
  mutator: PLACEHOLDER_MUTATOR,
  tooltip: 'Drag a block from the toolbox into this spot.',
};

const generator: GeneratorFunction = () => '';

export default {definition, generator};
