import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

export const JOIN_TEXT_BLOCK_TYPE = 'spritelab2_joinText';

/** Two pieces of text as one, so a fixed instruction can go with what the
    player typed. */
const definition: BlockJson = {
  type: JOIN_TEXT_BLOCK_TYPE,
  message0: 'join %1 %2',
  args0: [
    {type: 'input_value', name: 'A', check: 'String'},
    {type: 'input_value', name: 'B', check: 'String'},
  ],
  inputsInline: true,
  output: 'String',
  style: BlockStyles.DEFAULT,
  tooltip: 'Puts the second text right after the first.',
};

const generator: GeneratorFunction = (block, generator) => {
  const a = generator.valueToCode(block, 'A', Order.NONE) || "''";
  const b = generator.valueToCode(block, 'B', Order.NONE) || "''";
  return [`String(${a}) + String(${b})`, Order.ADDITION];
};

export default {definition, generator};
