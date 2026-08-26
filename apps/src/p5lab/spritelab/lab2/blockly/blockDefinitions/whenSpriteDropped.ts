import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const WHEN_SPRITE_DROPPED_BLOCK_TYPE = 'spritelab2_whenSpriteDropped';
export const EVENT_HAT_EXTENSION = 'spritelab2_event_hat';

/** Runs the blocks below it each time a dragged sprite is let go. */
const definition: BlockJson = {
  type: WHEN_SPRITE_DROPPED_BLOCK_TYPE,
  message0: 'when a sprite is dropped',
  nextStatement: null,
  style: BlockStyles.EVENT,
  extensions: [EVENT_HAT_EXTENSION],
  tooltip: 'Runs each time you let go of a sprite you were dragging.',
};

// The blocks below the hat are the handler; the extension keeps the generator
// from also emitting them as the hat's successors.
const generator: GeneratorFunction = (block, generator) => {
  const next = block.getNextBlock();
  const body = next
    ? generator.prefixLines(generator.blockToCode(next) as string, '  ')
    : '';
  return `whenSpriteDropped(function () {\n${body}});\n`;
};

export default {definition, generator};
