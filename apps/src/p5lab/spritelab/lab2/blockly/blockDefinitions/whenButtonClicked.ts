import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {HAT_OPTIONS, hatBody} from './eventHat';

export const WHEN_BUTTON_CLICKED_BLOCK_TYPE = 'spritelab2_whenButtonClicked';

// The label is typed, not picked: buttons exist only once the program runs,
// so there is no list to pick from while editing.
const definition: BlockJson = {
  type: WHEN_BUTTON_CLICKED_BLOCK_TYPE,
  message0: 'when button %1 clicked',
  args0: [{type: 'field_input', name: 'LABEL', text: 'Help Me!'}],
  nextStatement: null,
  style: BlockStyles.EVENT,
  tooltip: 'Runs the blocks below when the button with these words is clicked.',
};

const generator: GeneratorFunction = (block, generatorInstance) =>
  `whenButtonClicked(${JSON.stringify(
    block.getFieldValue('LABEL')
  )}, function () {\n${hatBody(block, generatorInstance)}});\n`;

export default {definition, generator, extendedOptions: HAT_OPTIONS};
