import {Order} from 'blockly/javascript';

import {BlockStyles} from '@cdo/apps/blockly/constants';
import {BlockJson, GeneratorFunction} from '@cdo/apps/blockly/types';

import {noteImageFieldValue} from '../../imageReferences';
import {FIELD_COSTUME_TYPE} from '../imagePickerFields';

export const SAY_BLOCK_TYPE = 'spritelab2_say';

/** A speech bubble whose text comes from a value, so "AI answer" and
    "entered text" fit where the library's say block takes typed text. */
const definition: BlockJson = {
  type: SAY_BLOCK_TYPE,
  message0: '%1 says %2',
  args0: [
    {type: FIELD_COSTUME_TYPE, name: 'SPRITE'},
    {type: 'input_value', name: 'TEXT', check: 'String'},
  ],
  inputsInline: true,
  previousStatement: null,
  nextStatement: null,
  style: BlockStyles.DEFAULT,
  tooltip: 'The sprite says the text in a speech bubble.',
};

const generator: GeneratorFunction = (block, generator) => {
  const text = generator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return `spriteSay({costume: ${noteImageFieldValue(
    block.getFieldValue('SPRITE')
  )}}, String(${text}));\n`;
};

export default {definition, generator};
