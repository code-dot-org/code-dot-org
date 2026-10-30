import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {EVENT_HAT_EXTENSION} from './whenPlayer';

export const WHEN_AI_ANSWERS_BLOCK_TYPE = 'spritelab2_whenAIAnswers';

const definition: BlockJson = {
  type: WHEN_AI_ANSWERS_BLOCK_TYPE,
  message0: 'when AI answers',
  nextStatement: null,
  style: BlockStyles.EVENT,
  extensions: [EVENT_HAT_EXTENSION],
  tooltip: 'Runs the blocks below once an "ask AI" block gets its answer back.',
};

// The blocks below the hat are the handler; eventHat keeps them out of the
// hat's next chain.
const generator: GeneratorFunction = (block, javascript) => {
  const next = block.nextConnection?.targetBlock() ?? null;
  const handler = next ? String(javascript.blockToCode(next, false)) : '';
  const body = handler ? javascript.prefixLines(handler, '  ') : '';
  return `whenAIAnswers(function () {\n${body}});\n`;
};

export default {definition, generator};
