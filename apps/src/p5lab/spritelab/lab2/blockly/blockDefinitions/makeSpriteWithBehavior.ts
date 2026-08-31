import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const MAKE_SPRITE_WITH_BEHAVIOR_BLOCK_TYPE =
  'spritelab2_makeSpriteWithBehavior';

/** A small sprite that starts with a behavior: a prop a character reacts to. */
const definition: BlockJson = {
  type: MAKE_SPRITE_WITH_BEHAVIOR_BLOCK_TYPE,
  message0: 'make new %1 sprite at %2 with behavior %3',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'ANIMATION_NAME'},
    {type: 'input_value', name: 'LOCATION', check: 'Location'},
    {type: 'input_value', name: 'BEHAVIOR', check: 'Behavior'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip: 'Makes a small sprite at this spot that starts with this behavior.',
};

const generator: GeneratorFunction = (block, generator) => {
  const location =
    generator.valueToCode(block, 'LOCATION', Order.NONE) || 'undefined';
  const behavior =
    generator.valueToCode(block, 'BEHAVIOR', Order.NONE) || 'undefined';
  return `makeSpriteWithBehavior({costume: ${block.getFieldValue(
    'ANIMATION_NAME'
  )}}, ${location}, ${behavior});\n`;
};

export default {definition, generator};
