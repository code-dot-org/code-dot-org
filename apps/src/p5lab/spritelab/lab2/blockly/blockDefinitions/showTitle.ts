import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const SHOW_TITLE_BLOCK_TYPE = 'spritelab2_showTitle';

/** Big text across the middle of the game for a moment: a win, a scene's
    name, a taunt. It lasts as long as a say bubble does. */
const definition: BlockJson = {
  type: SHOW_TITLE_BLOCK_TYPE,
  message0: 'show title %1',
  args0: [{type: 'field_input', name: 'TEXT', text: 'You win!'}],
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'Shows big text across the middle of the game for a moment.',
};

const generator: GeneratorFunction = block =>
  `showTitle(${JSON.stringify(block.getFieldValue('TEXT'))});\n`;

export default {definition, generator};
