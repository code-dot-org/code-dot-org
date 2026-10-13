import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const WHEN_TEXT_ENTERED_BLOCK_TYPE = 'spritelab2_whenTextEntered';

/** Runs its blocks each time the player sends text from the field that
    appears over the game while this block is in the program. */
const definition: BlockJson = {
  type: WHEN_TEXT_ENTERED_BLOCK_TYPE,
  message0: 'when text entered %1 %2',
  args0: [
    {type: 'input_dummy', name: 'ROW'},
    {type: 'input_statement', name: 'DO'},
  ],
  style: BlockStyles.EVENT,
  tooltip:
    'A text field appears over the game. Each time the player sends ' +
    'something, these blocks run; "entered text" holds what they sent.',
};

const generator: GeneratorFunction = (block, generator) =>
  `whenTextEntered(function () {\n${generator.statementToCode(
    block,
    'DO'
  )}});\n`;

export default {definition, generator};
