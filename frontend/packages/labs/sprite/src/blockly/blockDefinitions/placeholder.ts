import type * as BlocklyCore from 'blockly/core';

import {defineExtension, defineMutator} from '@code-dot-org/blockly';

import {BlockStyles} from '../constants';
import {placeholderOutline} from '../placeholderRendering';
import {type BlockJson, type GeneratorFunction} from '../types';

import {
  PLACEHOLDER_BLOCK_TYPE,
  PLACEHOLDER_MUTATOR,
  PLACEHOLDER_OUTLINE_EXTENSION,
  PLACEHOLDER_SPACER,
  PLACEHOLDER_SPACER_FIELD,
  type PlaceholderBlock,
  type PlaceholderState,
  TRANSPARENT_PIXEL,
} from './placeholderConstants';

export {
  PLACEHOLDER_BLOCK_TYPE,
  PLACEHOLDER_OUTLINE_EXTENSION,
  PLACEHOLDER_MUTATOR,
  PLACEHOLDER_CLASS,
  PLACEHOLDER_ACTIVE_CLASS,
  PLACEHOLDER_SPACER_FIELD,
  PLACEHOLDER_SPACER,
} from './placeholderConstants';
export type {PlaceholderBlock, PlaceholderState} from './placeholderConstants';

/** Keeps the `like` block through save and load. */
export const placeholderMutator = {
  saveExtraState(this: PlaceholderBlock): PlaceholderState | null {
    return this.like ? {like: this.like} : null;
  },
  loadExtraState(this: PlaceholderBlock, state: PlaceholderState) {
    this.like = state.like;
  },
};

const placeholderLikeMutator = defineMutator(
  PLACEHOLDER_MUTATOR,
  placeholderMutator,
);

const placeholderOutlineExtension = defineExtension(
  PLACEHOLDER_OUTLINE_EXTENSION,
  {
    extension() {
      placeholderOutline.call(this as unknown as BlocklyCore.Block);
    },
  },
);

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
  previousStatement: true,
  nextStatement: true,
  style: BlockStyles.DEFAULT,
  extensions: [placeholderOutlineExtension],
  mutator: placeholderLikeMutator,
  tooltip: 'Drag a block from the toolbox into this spot.',
};

const generator: GeneratorFunction = () => '';

export default {definition, generator};
