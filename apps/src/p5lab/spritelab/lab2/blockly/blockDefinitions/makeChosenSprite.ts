import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {CHOSEN_IMAGE} from '../../runtimeImages';

export const MAKE_CHOSEN_SPRITE_BLOCK_TYPE = 'spritelab2_makeChosenSprite';

const definition: BlockJson = {
  type: MAKE_CHOSEN_SPRITE_BLOCK_TYPE,
  message0: 'make the chosen sprite at %1',
  args0: [{type: 'input_value', name: 'LOCATION', check: 'Location'}],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.SPRITE,
  tooltip:
    'Makes a sprite wearing the costume of the chosen sprite, such as the ' +
    'picture clicked in the last scene.',
};

const generator: GeneratorFunction = (block, generatorInstance) =>
  `makeNewSpriteAnon(${noteImageFieldValue(JSON.stringify(CHOSEN_IMAGE))}, ${
    generatorInstance.valueToCode(block, 'LOCATION', Order.COMMA) || 'null'
  });\n`;

export default {definition, generator};
